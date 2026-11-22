import { beforeEach, describe, expect, it, vi } from "vitest";

// Record every SQL statement the route runs instead of hitting Postgres.
const queries: string[] = [];
let selectRows: { id: string; rating: number }[] = [];

vi.mock("@vercel/postgres", () => ({
  sql: vi.fn(async (strings: TemplateStringsArray) => {
    const text = strings.join("?").replace(/\s+/g, " ").trim();
    queries.push(text);
    if (text.startsWith("SELECT")) return { rows: selectRows };
    if (text.startsWith("INSERT")) return { rows: [{ id: "new-id" }] };
    return { rows: [] };
  }),
}));

const { POST, GET } = await import("@/app/api/ratings/quick/route");

const post = (body: unknown, ip = "203.0.113.7") =>
  POST(
    new Request("http://localhost/api/ratings/quick", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    }) as never
  );

beforeEach(() => {
  queries.length = 0;
  selectRows = [];
});

describe("POST /api/ratings/quick", () => {
  it("creates a new rating without a token and never looks anything up by IP", async () => {
    const res = await post({ recipeId: "r1", rating: 5 });
    const data = await res.json();

    expect(data.action).toBe("created");
    expect(typeof data.ratingToken).toBe("string");
    expect(queries.some((q) => q.includes("ip_address = "))).toBe(false);
    expect(queries[0]).toMatch(/^INSERT INTO comments/);
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

  it("slows down floods of new ratings from one network", async () => {
    const ip = "198.51.100.9";
    for (let i = 0; i < 30; i++) await post({ recipeId: `r${i}`, rating: 4 }, ip);
    expect((await post({ recipeId: "one-more", rating: 4 }, ip)).status).toBe(429);
  });
});

describe("GET /api/ratings/quick", () => {
  it("returns no rating without a token instead of guessing by IP", async () => {
    const res = await GET(new Request("http://localhost/api/ratings/quick?recipeId=r1") as never);
    expect(await res.json()).toEqual({ hasRated: false, rating: null });
    expect(queries).toHaveLength(0);
  });
});
