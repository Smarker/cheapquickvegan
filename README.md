```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the blog.

## Recipe Content Enhancement

### Adding Manual Step Names

By default, step names are auto-generated from the instruction text. To provide custom step names:

**Format:** `**Step Name:** Instruction text here`

**Example:**

```markdown
## Instructions

**Preheat Oven:** Preheat your oven to 450°F.
**Prepare Vegetables:** Chop all vegetables into bite-sized pieces.
**Mix Ingredients:** In a large bowl, combine all ingredients.
```

### Adding Step Images

You can add images to recipe steps in three ways:

**1. Notion Images (Recommended):**

```markdown
- Mix all ingredients together. ![Mixing bowl](/images/recipe-name-step-1.jpg)
```

**2. Instagram Posts:**

```markdown
- Bake for 25-30 minutes. Check out the final result: https://instagram.com/p/ABC123xyz
```

**3. External URLs:**

```markdown
- Serve warm with garnish. ![Final dish](https://example.com/image.jpg)
```

**Note:** Images are optional. Steps without images will simply omit the image field in the recipe schema.

### SEO Benefits

- Custom step names improve Google search results
- Step images enhance recipe cards in search
- Each step gets a unique URL for deep-linking (e.g., `#step-1`)
