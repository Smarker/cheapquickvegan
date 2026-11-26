import { beforeEach, describe, expect, it, vi } from "vitest";

// Record every SQL statement the route runs instead of hitting Postgres.
const queries: string[] = [];
let selectRows: { id: string; rating: number }[] = [];
// What the per-IP count query reports: new ratings from this IP in the last hour,
// and for this recipe in the last day.
let recent = { last_hour: "0", this_recipe: "0" };

vi.mock("@vercel/postgres", () => ({
  sql: vi.fn(async (strings: TemplateStringsArray) => {
    const text = strings.join("?").replace(/\s+/g, " ").trim();
    queries.push(text);
    if (text.includes("COUNT(*)")) return { rows: [recent] };
    if (text.startsWith("SELECT")) return { rows: selectRows };
    if (text.startsWith("INSERT")) return { rows: [{ id: "new-id" }] };
    return { rows: [] };
  }),
}));

const { POST, GET } = await import("@/app/api/ratings/quick/route");

const post = (body: unknown, headers: Record<string, string> = { "x-real-ip": "203.0.113.7" }) =>
  POST(
    new Request("http://localhost/api/ratings/quick", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }) as never
  );

beforeEach(() => {
  queries.length = 0;
  selectRows = [];
  recent = { last_hour: "0", this_recipe: "0" };
});

const insertedValues = async () => {
  const { sql } = await import("@vercel/postgres");
  const calls = vi.mocked(sql).mock.calls;
  return calls[calls.length - 1].slice(1);
};

describe("POST /api/ratings/quick", () => {
  it("creates a new rating without a token and only uses the IP to count, never to match", async () => {
    const res = await post({ recipeId: "r1", rating: 5 });
    const data = await res.json();

    expect(data.action).toBe("created");
    expect(typeof data.ratingToken).toBe("string");
    expect(queries[0]).toMatch(/^SELECT COUNT\(\*\)/);
    expect(queries[1]).toMatch(/^INSERT INTO comments/);
    expect(queries.some((q) => q.startsWith("UPDATE"))).toBe(false);
  });

  it("does not overwrite a stranger's rating from the same IP", async () => {
    // Even if a rating from this IP exists, a request without that rating's token creates a new one.
    selectRows = [{ id: "someone-else", rating: 2 }];
    const data = await (await post({ recipeId: "r1", rating: 4 })).json();

    expect(data.action).toBe("created");
    expect(queries.some((q) => q.startsWith("UPDATE"))).toBe(false);
  });

  it("updates the rating that matches the caller's token", async () => {
    selectRows = [{ id: "mine", rating: 3 }];
    const data = await (await post({ recipeId: "r1", rating: 5, ratingToken: "tok" })).json();

    expect(data).toMatchObject({ action: "updated", ratingToken: "tok", previousRating: 3 });
    expect(queries.some((q) => q.startsWith("UPDATE comments"))).toBe(true);
  });

  it("creates a new rating when the token matches nothing", async () => {
    const data = await (await post({ recipeId: "r1", rating: 5, ratingToken: "stale" })).json();
    expect(data.action).toBe("created");
  });

  it("rejects ratings outside 1 to 5 and non-whole numbers", async () => {
    expect((await post({ recipeId: "r1", rating: 6 })).status).toBe(400);
    expect((await post({ recipeId: "r1", rating: 2.5 })).status).toBe(400);
  });

  it("slows down floods of new ratings from one network, counted from saved ratings", async () => {
    recent = { last_hour: "30", this_recipe: "0" };
    expect((await post({ recipeId: "one-more", rating: 4 })).status).toBe(429);
    expect(queries.some((q) => q.startsWith("INSERT"))).toBe(false);
  });

  it("allows one new rating per network per recipe per day", async () => {
    recent = { last_hour: "1", this_recipe: "1" };
    expect((await post({ recipeId: "r1", rating: 1 })).status).toBe(429);
    expect(queries.some((q) => q.startsWith("INSERT"))).toBe(false);
  });

  it("still lets the token holder change their rating when the network is at its limit", async () => {
    recent = { last_hour: "30", this_recipe: "1" };
    selectRows = [{ id: "mine", rating: 3 }];
    const data = await (await post({ recipeId: "r1", rating: 5, ratingToken: "tok" })).json();
    expect(data.action).toBe("updated");
  });

  it("skips the IP limits and stores no IP when the IP is unknown", async () => {
    recent = { last_hour: "999", this_recipe: "999" };
    const data = await (await post({ recipeId: "r1", rating: 4 }, {})).json();

    expect(data.action).toBe("created");
    expect(queries.some((q) => q.includes("COUNT(*)"))).toBe(false);
    expect(await insertedValues()).toContain(null);
  });

  it("prefers x-real-ip over a client-supplied x-forwarded-for", async () => {
    await post({ recipeId: "r1", rating: 4 }, { "x-real-ip": "203.0.113.7", "x-forwarded-for": "1.2.3.4" });
    expect(await insertedValues()).toContain("203.0.113.7");
    expect(await insertedValues()).not.toContain("1.2.3.4");
  });

  it("treats a header that isn't an IP as unknown instead of failing the insert", async () => {
    const res = await post({ recipeId: "r1", rating: 4 }, { "x-forwarded-for": "abc" });
    expect(res.status).toBe(200);
    expect(await insertedValues()).not.toContain("abc");
  });
});

describe("GET /api/ratings/quick", () => {
  it("returns no rating without a token instead of guessing by IP", async () => {
    const res = await GET(new Request("http://localhost/api/ratings/quick?recipeId=r1") as never);
    expect(await res.json()).toEqual({ hasRated: false, rating: null });
    expect(queries).toHaveLength(0);
  });
});
