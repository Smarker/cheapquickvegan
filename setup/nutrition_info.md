# Nutrition System Setup Guide

This guide will help you set up and use the ingredient-based nutrition calculation system for your vegan food blog.

## Overview

The nutrition system allows you to:
- Store reusable ingredients with USDA-accurate nutrition data
- Calculate recipe nutrition by mapping ingredients
- Display FDA-style nutrition labels on recipe pages
- Improve SEO with schema.org nutrition markup

## Quick Start

### 1. Run the Database Migration

First, you need to create the database tables for ingredients and recipe calculations.

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Postgres** → **Query**
3. Open the migration file: `migrations/002_create_ingredients_schema.sql`
4. Copy and paste the entire SQL content
5. Click "Run Query"

**Option B: Via Local Development**

If you have the Vercel CLI installed:

```bash
# Connect to your Vercel Postgres database
vercel env pull .env.local

# Run the migration (you may need to do this manually via SQL)
```

### 2. Add Your First Ingredients

1. Sign up for a free USDA API key at https://fdc.nal.usda.gov/api-key-signup.html

2. Add the API key to your .env.local file

Start by adding common vegan ingredients you use frequently to your database.

**Add from USDA Database:**

```bash
pnpm ingredient:add
```

This will:
- Prompt you for an ingredient name
- Search the USDA FoodData Central database
- Let you select the correct match
- Calculate nutrition per your chosen serving size
- Save to your database

**Example Session:**

```
Ingredient name: chickpeas canned

Searching USDA database...

Found 5 results:
1. Chickpeas (garbanzo beans), canned, drained [FDC: 173757]
2. Chickpeas (garbanzo beans), canned, undrained [FDC: 173756]
...

Select (1-5): 1

Serving size options:
1. 1 cup (240g)
2. 1/2 cup (120g)
3. 100g
4. Custom

Select: 1

✅ Added: chickpeas
```

**Add Manually (for specialty vegan products):**

```bash
pnpm ingredient:add-manual
```

Use this for ingredients not in the USDA database (e.g., specific vegan brands).

### 3. Build Your Ingredient Library

Add 20-30 common ingredients you use frequently. Recommended starter ingredients:

**Proteins:**
- Chickpeas (canned)
- Black beans (canned)
- Lentils (dry)
- Firm tofu
- Tempeh

**Grains:**
- Rice (white/brown)
- Quinoa
- Pasta
- Bread
- Oats

**Nuts/Seeds:**
- Tahini
- Peanut butter
- Almond butter
- Chia seeds
- Hemp hearts

**Dairy Alternatives:**
- Soy yogurt (your preferred brand)
- Oat milk
- Vegan cheese

**Oils & Condiments:**
- Olive oil
- Coconut oil
- Soy sauce
- Nutritional yeast

**Vegetables (common ones):**
- Onion
- Garlic
- Tomato
- Cucumber
- Spinach

### 4. Calculate Recipe Nutrition

Once you have ingredients in your database, calculate nutrition for a recipe:

```bash
pnpm recipe:calculate -- --slug your-recipe-slug
```

**Example:**

```bash
pnpm recipe:calculate -- --slug vegan-tzatziki-sauce
```

The script will:
1. Load the recipe from cache
2. Extract ingredients from the recipe content
3. For each ingredient:
   - Search your ingredient database
   - Let you select the matching ingredient
   - Ask for the quantity used
   - Calculate nutrition
4. Sum everything up
5. Divide by servings
6. Display Notion-ready format

**Interactive Example:**

```
Recipe: Vegan Tzatziki Sauce
Servings: 4

Ingredient 1/8: "1 pint of plain greek vegan yogurt"

Search database: yogurt
Found:
1. Yogurt, Soy, Plain (1 cup = 240g)

Select: 1

Quantity used: 2 cups
Calculated: 293 calories, 7.7g fat, 29.8g carbs, 14.4g protein

...

PER SERVING (÷ 4):
- Calories: 178
- Total Fat: 14g
- Sodium: 590mg
- Total Carbs: 10g
- Protein: 5g

📋 Copy to Notion:

Serving Size: 1/4 recipe (approx 1/2 cup)
Servings Per Recipe: 4
Calories: 178
Total Fat: 14
Saturated Fat: 2
Sodium: 590
Total Carbohydrates: 10
Dietary Fiber: 1
Protein: 5
```

### 5. Add Nutrition to Notion

After calculating nutrition, copy the values to your Notion recipe database:

1. Open the recipe in Notion
2. Add these number/text properties if you haven't already:
   - Serving Size (text)
   - Servings Per Recipe (number)
   - Calories (number)
   - Total Fat (number)
   - Saturated Fat (number)
   - Sodium (number)
   - Total Carbohydrates (number)
   - Dietary Fiber (number)
   - Protein (number)
3. Paste the values from the calculator output

**Important:** Enter numbers only (no units). For example:
- ✅ Correct: `14` (for Total Fat)
- ❌ Wrong: `14g`

### 6. Rebuild Your Site

After adding nutrition to Notion, rebuild your site to see the nutrition labels:

```bash
pnpm run build
# or for local development:
pnpm run dev
```

The nutrition label will automatically appear on recipe pages that have nutrition data!

## CLI Commands Reference

### Ingredient Management

```bash
# Add ingredient from USDA database
pnpm ingredient:add

# Add ingredient manually
pnpm ingredient:add-manual

# List all ingredients
pnpm ingredient:list

# Search ingredients
pnpm ingredient:search [query]

# Edit an ingredient
pnpm ingredient:edit [name or ID]

# Export ingredients to JSON/CSV
pnpm ingredient:export -- --format json --output ingredients.json

# Import ingredients from JSON/CSV
pnpm ingredient:import -- --file ingredients.json
```

### Recipe Nutrition

```bash
# Calculate recipe nutrition
pnpm recipe:calculate -- --slug recipe-slug-here
```

## Notion Database Setup

### Required Properties

Add these properties to your Notion recipes database:

| Property Name | Type | Format | Description |
|---------------|------|--------|-------------|
| Serving Size | Text | - | e.g., "1/4 recipe (approx 1/2 cup)" |
| Servings Per Recipe | Number | Number | Total servings (e.g., 4) |
| Calories | Number | Number | Calories per serving |
| Total Fat | Number | Number | Grams per serving |
| Saturated Fat | Number | Number | Grams per serving |
| Trans Fat | Number | Number | Grams per serving (usually 0) |
| Cholesterol | Number | Number | Milligrams per serving (usually 0) |
| Sodium | Number | Number | Milligrams per serving |
| Total Carbohydrates | Number | Number | Grams per serving |
| Dietary Fiber | Number | Number | Grams per serving |
| Total Sugars | Number | Number | Grams per serving |
| Protein | Number | Number | Grams per serving |

**Optional Properties** (for more detailed labels):

| Property Name | Type | Format | Description |
|---------------|------|--------|-------------|
| Vitamin D | Number | Number | Micrograms per serving |
| Calcium | Number | Number | Milligrams per serving |
| Iron | Number | Number | Milligrams per serving |
| Potassium | Number | Number | Milligrams per serving |

### Creating Helpful Views

**View 1: "Missing Nutrition"**
- Filter: Where `Calories` is empty
- Shows recipes that need nutrition added

**View 2: "Nutrition Complete"**
- Filter: Where `Calories` is not empty
- Shows recipes with nutrition data

**View 3: "High Protein"**
- Filter: Where `Protein` is greater than 15
- Sorted by: Protein (descending)

## Workflow

### One-Time Setup (2-3 hours)

1. Run database migration (5 minutes)
2. Add 50-100 common vegan ingredients using `pnpm ingredient:add` (1-2 hours)
3. Add nutrition fields to Notion (10 minutes)

### Per Recipe (5-10 minutes)

1. Run `pnpm recipe:calculate -- --slug [recipe-slug]`
2. Map ingredients to database (script guides you)
3. Copy nutrition to Notion
4. Next build picks it up automatically

## Tips & Best Practices

### Ingredient Naming

- **Use lowercase:** The system stores ingredients in lowercase (e.g., "chickpeas" not "Chickpeas")
- **Be specific:** "chickpeas canned drained" vs just "chickpeas"
- **Add brand info:** "silk unsweetened soy yogurt" for accuracy
- **Use aliases:** Add common variations (e.g., aliases: ["chickpeas", "garbanzo beans"])

### Nutrition Accuracy

- **Start with 100g:** When searching USDA, you can always scale to your serving size
- **Brand matters:** Nutrition varies by brand for vegan products
- **Measure carefully:** Use kitchen scale when possible
- **Update regularly:** Check ingredient nutrition annually

### Troubleshooting

**"Recipe not found"**
- Make sure you've run `pnpm run cache:recipes` recently
- Check the recipe slug is correct (use kebab-case)

**"No ingredients found"**
- Build your ingredient database first with `pnpm ingredient:add`
- Search for common names (e.g., "chickpeas" not "garbanzo beans")
- Try adding the ingredient manually

**"Conversion error"**
- The unit converter supports common cooking measurements
- For unusual units, convert to grams manually
- Add density info to the converter for better accuracy

**"Nutrition not showing on site"**
- Verify nutrition is in Notion (open the recipe and check)
- Run `pnpm run cache:recipes` to refresh the cache
- Rebuild your site with `pnpm run build`

## SEO Benefits

The nutrition system automatically adds schema.org markup to your recipe pages:

```json
{
  "@type": "Recipe",
  "nutrition": {
    "@type": "NutritionInformation",
    "servingSize": "1/4 recipe",
    "calories": "178 calories",
    "fatContent": "14g",
    "carbohydrateContent": "10g",
    "proteinContent": "5g"
  }
}
```

This enables:
- Google Rich Snippets with nutrition info
- Better rankings for "[recipe name] calories" searches
- Increased click-through rates

## Export/Import

### Exporting Your Ingredient Library

Export your ingredients to share or backup:

```bash
# Export to JSON
pnpm ingredient:export -- --format json --output my-ingredients.json

# Export to CSV
pnpm ingredient:export -- --format csv --output my-ingredients.csv
```

### Importing Ingredient Packs

Import pre-built ingredient libraries:

```bash
pnpm ingredient:import -- --file vegan-starter-pack.json
```

## Database Schema

### `ingredients` Table

Stores reusable ingredient nutrition data.

Key fields:
- `name`: Ingredient name (unique, lowercase)
- `serving_size`: Human-readable serving (e.g., "1 cup")
- `serving_weight_grams`: Weight in grams
- `calories`: Calories per serving
- Macros: `total_fat`, `total_carbohydrates`, `protein`, etc.
- `source`: Where data came from ('usda', 'manual', 'packaging')

### `recipe_nutrition_calculations` Table

Audit trail of recipe calculations (optional).

Stores:
- Recipe ID/slug
- Ingredient mappings
- Calculated totals
- Date/time of calculation

## API Information

### USDA FoodData Central API

- **Base URL:** https://api.nal.usda.gov/fdc/v1
- **Cost:** Free, unlimited
- **API Key:** Optional (not required for basic usage)
- **Get API Key:** https://fdc.nal.usda.gov/api-key-signup.html

To add an API key (optional):

```bash
# Add to .env.local
USDA_API_KEY=your_api_key_here
```

## Support

If you encounter issues:

1. Check this documentation
2. Review the troubleshooting section
3. Check ingredient names (lowercase, common terms)
4. Verify database migration ran successfully
5. Ensure Notion properties are set up correctly

## Next Steps

Once you're comfortable with the basics:

1. **Build a comprehensive ingredient library** (50-100 items)
2. **Calculate nutrition for popular recipes** (start with 10-20)
3. **Monitor SEO impact** (Google Search Console)
4. **Create ingredient packs** for different cuisine types
5. **Share your ingredient library** with other vegan bloggers

---

Happy cooking! 🌱
