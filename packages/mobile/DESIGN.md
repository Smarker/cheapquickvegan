---
name: CheapQuickVegan
description: Stephanie's cheap, quick vegan recipes as a calm kitchen companion for iOS and Android.
colors:
  ground: "#F7F3EA"
  mist: "#EDE7DA"
  sand: "#EFE6D3"
  ink: "#2B2A24"
  muted: "#59574C"
  control: "#8E8A7B"
  green: "#5E8B4E"
  green-deep: "#3A5E30"
  green-soft: "#E3EDDA"
  sage: "#B7D3A0"
  sage-soft: "#E6EFDF"
  tape: "#D9C49A"
  tint-meal: "#E6EFDF"
  tint-side: "#ECEADF"
  tint-breakfast: "#F2E9D6"
  tint-snack: "#EFE9DD"
  tint-dessert: "#F1E6DA"
  dark-ground: "#191A16"
  dark-mist: "#27281F"
  dark-sand: "#2E2A20"
  dark-ink: "#EFECE2"
  dark-muted: "#BAB6A8"
  dark-green: "#8FC27A"
  dark-green-deep: "#B6DBA2"
  dark-sage: "#9CC488"
  cook-ground: "#1D1E19"
  cook-raised: "#2A2B24"
  cook-ink: "#F3EFE3"
  cook-soft: "#CFCABC"
typography:
  display:
    fontFamily: "Source Serif 4 Light"
    fontSize: "40px"
    fontWeight: 300
    lineHeight: "46px"
    letterSpacing: "-0.6px"
  headline:
    fontFamily: "Source Serif 4 Bold"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: "36px"
    letterSpacing: "-0.3px"
  title:
    fontFamily: "Source Serif 4 Bold"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "27px"
    letterSpacing: "-0.2px"
  row-title:
    fontFamily: "Source Serif 4 Bold"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: "21px"
  body:
    fontFamily: "Rubik"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  cook-step:
    fontFamily: "Rubik"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: "36px"
  small:
    fontFamily: "Rubik"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Rubik Medium"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "18px"
  hand:
    fontFamily: "Gochi Hand"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: "24px"
rounded:
  tag: "8px"
  checkbox: "7px"
  chip: "18px"
  card: "24px"
  photo: "28px"
  pill: "999px"
spacing:
  xs: "4px"
  s: "8px"
  m: "12px"
  l: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.sage}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "56px"
    padding: "0 24px"
  button-secondary:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
  action-round:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.green}"
    rounded: "{rounded.pill}"
    size: "48px"
  action-round-on:
    backgroundColor: "{colors.green}"
    textColor: "{colors.ground}"
    rounded: "{rounded.pill}"
    size: "48px"
  pill:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.muted}"
    rounded: "{rounded.chip}"
    height: "44px"
  pill-selected:
    backgroundColor: "{colors.sage}"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
    height: "44px"
  amount-tag:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tag}"
    padding: "0 6px"
  recipe-card:
    backgroundColor: "{colors.tint-meal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "10px"
---

# Design System: CheapQuickVegan

## Overview

**Creative North Star: "The Garden Trail"**

Cooking here is a walk, not a test. Recipes sit along a trail, quickest first, with handwritten signposts for time. Cuisines become journeys you hike from easy to summit, with refugios where you rest and learn a technique. The ground is warm sand paper; the planting is garden green; the drawings are ink lines by hand. A small tuxedo cat keeps you company on the trail, in cook mode and on journeys, and nowhere else.

The app is a calm kitchen tool, not a feed. Density is low and deliberate: one question per screen ("What's for dinner?"), one big action per screen ("Start cooking"), and everything else quiet. Personality lives in the details the cook meets while waiting or after finishing (signposts, the cat, the stirring pot, a pencil line through a ticked ingredient), never in the way of an instruction. In cook mode the phone is propped up and hands are messy, so the app switches to a dark charcoal page with very large step text, amounts inline, and voice.

**Key Characteristics:**
- Sand paper ground with garden greens; no blues next to food.
- Serif for names and headings, Rubik for anything you act on, handwriting only for warmth.
- Ink-line drawings (ingredients, equipment, doodles) in one stroke weight.
- Photos float on a soft shadow; the interface itself is flat.
- Soft, rounded, pressable controls with a small spring and a light haptic.
- One helper cat, only in cook mode and on journeys.

## Colors

Warm neutrals do almost all the work; greens are the garden planted in them, and fills never carry small text.

### Primary
- **Garden Green** (#5E8B4E; dark #8FC27A): the trail line, hearts, active icons, ticked boxes and timer chips' borders. Shapes and strokes, not paragraphs.
- **Deep Moss** (#3A5E30; dark #B6DBA2): the only colored text. Handwritten notes, ingredient names in steps, links like "Show in grams".

### Secondary
- **Sage Leaf** (#B7D3A0; dark #9CC488): fills for the primary button ("Start cooking", "Send list") and selected pills, always with dark ink text on top.
- **Washi Tape** (#D9C49A): the strip of tape holding a recipe card to the trail. Decoration only.

### Neutral
- **Sand Paper** (#F7F3EA; dark #191A16): the page.
- **Morning Mist** (#EDE7DA; dark #27281F): unselected pills, the search field, segmented track.
- **Dry Sand** (#EFE6D3; dark #2E2A20): tinted panels: Kitchen stats, warnings, amount tags.
- **Pencil Ink** (#2B2A24; dark #EFECE2): all body text and drawings.
- **Graphite** (#59574C; dark #BAB6A8): secondary text, captions.
- **Category tints**: Meal #E6EFDF, Side #ECEADF, Breakfast #F2E9D6, Snack #EFE9DD, Dessert #F1E6DA. Recipe cards and rows carry their category's tint.
- **Cook charcoal** (#1D1E19, raised #2A2B24, ink #F3EFE3, soft #CFCABC): cook mode's own dark page, in both light and dark themes.

### Named Rules
**The Food Comes First Rule.** No blues and no saturated accents anywhere near food photos. Greens and sand only, so the food is the brightest thing on screen.

**The Ink On Fill Rule.** Small text is always dark ink. Sage and green are for filled shapes; the only colored text is Deep Moss.

## Typography

**Display Font:** Source Serif 4 (Light for the big question, Bold for names and headings)
**Body Font:** Rubik (Regular, Medium, SemiBold)
**Hand Font:** Gochi Hand

**Character:** A serif with recipe-book manners for names and headings, a friendly round sans for every fact and control, and a handwriting face for the notes in the margin.

### Hierarchy
- **Display** (Source Serif 4 Light, 40/46, -0.6): the one question at the top of Discover ("What's for dinner?"), with the meal word in Bold.
- **Headline** (Source Serif 4 Bold, 30/36): recipe titles and screen titles (Kitchen, Search).
- **Title** (Source Serif 4 Bold, 22/27): section headings (Saved recipes, step sections, What's in your fridge?).
- **Row title** (Source Serif 4 Bold, 17/21): recipe names in lists and cards.
- **Body** (Rubik 16/24): descriptions, ingredient lines, Directions.
- **Cook step** (Rubik 26/36): step text in cook mode, read from arm's length.
- **Small / Label** (Rubik 14/20, Medium 14/18): captions, facts, buttons and pills.
- **Hand** (Gochi Hand 20/24): greetings, signposts, encouragement, empty states.

### Named Rules
**The Feelings, Not Facts Rule.** Handwriting is for warmth: greetings, signposts, encouragement, empty states. Anything the cook needs to act on or read precisely (counts, amounts, voice hints, errors, instructions) is in Rubik.

**The Android Clip Rule.** Handwritten text on Android always gets `textBreakStrategy="simple"`, a few pixels of right padding, and a line limit, or its last glyph clips.

## Layout

Single column on phones with a 24px side gutter (`space.xl`). Spacing follows a 4/8/12/16/24/32 scale. Sections are separated by generous space rather than rules. Horizontal scroll is reserved for the trail (one recipe card per stop, quickest first, with time signposts on a dotted line beneath) and journey cards.

The recipe page is a photo and title on the category tint, then a rounded sheet in Sand Paper holding the description, tabs and content; the one primary action, "Start cooking", is pinned at the bottom. Cook mode is full screen: progress trail at the top, one section per page, numbered steps, "Up next" and the buttons at the bottom.

Touch targets are at least 44pt / 48dp. Lists of choices show four or fewer at a decision point where possible.

## Elevation & Depth

Photos float; the interface is flat. Food photos, the round action buttons, the pinned cooking bar and floating hearts sit on one soft, downward shadow, like a photo pressed onto a page. Everything else separates by tone (Sand Paper → Mist → Dry Sand, or a category tint), never by borders or stacked shadows.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0px 10px 22px -12px rgba(60,52,32,0.14)`; dark `rgba(0,0,0,0.5)`): photos, round action buttons, the heart, the pinned bar.

### Named Rules
**The Photos Float Rule.** Only photos and the few floating controls get a shadow. Cards, chips, sheets and panels are flat and tinted.

## Shapes

Soft and round throughout. Cards and rows are 24px; recipe photos 28px; pills and chips 18px or fully round; buttons fully round; amount tags 8px; checkboxes 7px. Round icon buttons are 48px circles. Recipe cards on the trail are tilted a degree or two and held by a strip of washi tape. Ink drawings use rounded caps and joins at one stroke weight (1.8 on a 24 or 32 grid).

## Components

### Buttons
- **Shape:** fully round.
- **Primary:** Sage Leaf fill with ink text in Rubik SemiBold 16, at least 56px tall. One per screen ("Start cooking", "Next step", "Send list").
- **Secondary:** transparent with a 2px hairline border and ink label.
- **Press:** scales to about 0.97 with a light haptic; no color flash.

### Round actions
- **Style:** 48px circle on Sand Paper with a green icon and a small ink label underneath (Save, This week, Grocery list). On: filled green with a white icon.
- **Save:** the heart pops and scatters three tiny leaves.

### Pills and segmented choices
- **Style:** Mist fill, Graphite label; selected is Sage Leaf with ink. The time picker is a segmented track whose highlight slides.
- **Use:** tabs (Ingredients, Directions, Tips), time limits, filters. Pills mean choices; they are never used for status.

### Amount tags
- **Style:** small rounded tags (Dry Sand on the recipe page, raised charcoal in cook mode) with tabular numbers, placed right after an ingredient name, or wherever a time, temperature or stated quantity appears in a step. Found by shape, not color.

### Step list
- **Style:** a 26–30px numbered circle, then the step text. The current step's number is filled green and its text full ink; upcoming steps are quieter; ticked steps dim with a strike-through. Ingredient names bold Deep Moss; tools underlined with a green line.

### Cards and rows
- **Corner style:** 24px. **Background:** the recipe's category tint. **Shadow:** none (the photo inside floats). **Padding:** 10px around a rounded photo.

### Navigation
- **Tab bar:** four labelled tabs (Discover, Search, Kitchen, List) on Sand Paper with a hairline top border; the active tab gets a soft green pill behind its icon. Tapping the active tab returns to its first screen; Search always opens on the search page.

### The helper cat (signature)
A small tuxedo cat in ink line: black body with a cream outline, white muzzle, bib and paws, green eyes, pink inner ears, green collar with a tag, soft fur clumps along the back. It lives only in cook mode (walks the progress trail; sits, blinks, licks a paw, kneads, loafs, naps and rolls over when things are quiet; perks its ears for voice; paw-taps a finished timer; hops and chases its tail on the finish screen) and on journey pages (waiting at your next stop). It is still under Reduce Motion and never covers content.

### Ingredient and equipment drawings
Ink-line drawings on a 32×32 grid for 56 ingredients and the equipment tags, shown beside ingredient lines, grocery rows, search chips, the fridge picker and pantry stops. Stand-ins until Stephanie's own drawings replace them.

## Do's and Don'ts

### Do:
- **Do** keep one primary action per screen, in Sage Leaf with ink text.
- **Do** put amounts, times and temperatures in tags so they're found by shape; keep small text in ink.
- **Do** use the category tint for recipe cards and rows, and Dry Sand for informational panels.
- **Do** give every motion a Reduce Motion fallback (still, not just faster).
- **Do** keep the cook's messy hands in mind: big targets, inline amounts, voice, nothing that needs precise taps.
- **Do** make on/off chips say what "on" means: a tick on Sage Leaf for things you have, a cross in an ink outline for things to avoid, with a plain summary line ("Avoiding: soy").
- **Do** round scaled amounts the way each measure works: cups in quarters and thirds, tablespoons in halves, teaspoons down to ⅛; cloves and eggs whole, cans and blocks in halves, produce in quarters. Never scale below what can be measured.
- **Do** write the grocery list in shopping words ("jasmine rice", "1 lime"), with cooking notes ("for 1 cup cooked", "optional") as a quiet second line.
- **Do** give anything that removes or counts something a way back: Undo, Reset, "Take one off", "Come back to it".

### Don't:
- **Don't** use blue or saturated accents near food.
- **Don't** set counts, amounts, instructions, voice hints or errors in the handwriting font.
- **Don't** put shadows on cards, chips or panels; only photos and floating controls lift.
- **Don't** show the live cat outside cook mode and journey pages, or let it cover text. On keepsakes (the trail postcard) it is a still drawing.
- **Don't** add streaks, badges, rewards, confetti or nudges; cooked counts stay quiet records.
- **Don't** use pills for status; status is a tag, a stamp or plain text.
