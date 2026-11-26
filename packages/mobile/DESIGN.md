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

<!-- impeccable:design-map -->
Name: CheapQuickVegan
Colors: primary: green #5E8B4E; secondary: sage #B7D3A0; neutral: ground #F7F3EA; primary: green-deep #3A5E30; primary: green-soft #E3EDDA; primary: dark-green #8FC27A (+23 more in the sidecar)
Fonts: Source Serif 4 Light (display); Source Serif 4 Bold (headline, title, row-title); Rubik (body, cook-step, small); Rubik Medium (label); Gochi Hand (hand)
Spacing: xs 4px, s 8px, m 12px, l 16px, xl 24px, xxl 32px
Radius: tag 8px, checkbox 7px, chip 18px, card 24px, photo 28px, pill 999px
North Star: "The Garden Trail"
Rules:
- The Food Comes First Rule. No blues and no saturated accents anywhere near food photos.
- The Ink On Fill Rule. Small text is always dark ink.
- The Feelings, Not Facts Rule. Handwriting is for warmth: greetings, signposts, encouragement, empty states.
- The Android Clip Rule. Handwritten text on Android always gets `textBreakStrategy="simple"`, a few pixels of right padding, and a line limit, or its last glyph clips.
- The Whole Words Rule. Text follows Dynamic Type and Android font scale, and nothing that carries meaning truncates at 2.0×.
- The Photos Float Rule. Only photos and the few floating controls get a shadow.
Elevation:
- Lift: 0px 10px 22px -12px rgba(60,52,32,0.14)
Don't:
- Don't use blue or saturated accents near food.
- Don't set counts, amounts, instructions, voice hints or errors in the handwriting font.
- Don't put shadows on cards, chips or panels; only photos and floating controls lift.
- Don't show the live cat outside cook mode and journey pages, or let it cover text.
- Don't add streaks, badges, rewards, confetti or nudges; cooked counts stay quiet records.
- Don't use pills for status; status is a tag, a stamp or plain text.
Do:
- Do keep one primary action per screen, in Sage Leaf with ink text.
- Do put amounts, times and temperatures in tags so they're found by shape; keep small text in ink.
- Do use the category tint for recipe cards and rows, and Dry Sand for informational panels.
- Do give every motion a Reduce Motion fallback (still, not just faster).
- Do keep the cook's messy hands in mind: big targets, inline amounts, voice, nothing that needs precise taps.
- (+7 more)
Full: .impeccable/design-full.md (read a section when you need its detail)
