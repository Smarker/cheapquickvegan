import { describe, expect, it } from "vitest";
import { parseRecipeSections } from "../src/recipe-sections";

const CURRY = `
Intro paragraph.

## Recipe Details

- **Total Time:** 40 min

## Ingredients

This curry uses Maesri paste.

- 1 (4 oz) can Thai Red Curry Paste ([Maesri](https://example.com/maesri))
- 1 can full-fat coconut milk

## Instructions

### **Prepare the rice and tofu**

- Begin cooking the rice.
- Cut the tofu into small cubes. ![Tofu](/images/tofu.jpg)

### Build the curry base:

- Heat the coconut oil.

## Tips

- Use **any** veggies you like.

## Curry FAQs

- Not a tip.
`;

describe("parseRecipeSections", () => {
  const s = parseRecipeSections(CURRY);

  it("keeps ingredients as plain text with link labels", () => {
    expect(s.ingredients).toEqual([
      { name: null, items: ["1 (4 oz) can Thai Red Curry Paste (Maesri)", "1 can full-fat coconut milk"] },
    ]);
  });

  it("groups steps under their own subheadings, without bold, colons or images", () => {
    expect(s.steps).toEqual([
      { name: "Prepare the rice and tofu", items: ["Begin cooking the rice.", "Cut the tofu into small cubes."] },
      { name: "Build the curry base", items: ["Heat the coconut oil."] },
    ]);
  });

  it("reads tips and stops at the next section", () => {
    expect(s.tips).toEqual(["Use any veggies you like."]);
  });

  it("accepts bold headings and returns empty lists when a section is missing", () => {
    const bold = parseRecipeSections("## **Ingredients**\n\n- 1 cup flour\n");
    expect(bold.ingredients[0].items).toEqual(["1 cup flour"]);
    expect(bold.steps).toEqual([]);
    expect(bold.tips).toEqual([]);
  });
});
