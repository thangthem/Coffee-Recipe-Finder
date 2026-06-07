# Coffee Recipe Finder - Feature Enhancement Plan

## Objective

Implement 3 new user-centric features while preserving the current visual identity and brewing simulation experience.

### New Features

1. Weather & Time Based Coffee Recommendation
2. Brew Cost Calculator
3. Side-by-Side Coffee Bean Comparison

---

# Critical Design Constraints

## Visual Design

DO NOT modify:

* Existing color palette
* Existing typography
* Existing fonts
* Existing spacing system
* Existing animations
* Existing branding
* Existing theme

The website should feel like the same product after implementation.

Users should perceive these as natural feature additions rather than a redesign.

---

# UX Philosophy

Current website strength:

* Beautiful brewing experience
* Minimal and focused interface

The new features must:

* Reduce decision fatigue
* Improve coffee discovery
* Improve purchase confidence
* Maintain simplicity

Avoid dashboard-style layouts.

Avoid clutter.

Avoid adding excessive controls.

---

# Feature 1 - Weather & Time Based Recommendation

## Business Goal

Help users discover suitable coffee based on current environment.

Creates a more personalized experience.

---

## Data Sources

### Weather

Use:

```text
OpenWeatherMap API (Free Tier)
```

### User Location

Use:

```text
Browser Geolocation API
```

---

## User Flow

On first visit:

Ask:

```text
Allow location access?
```

If granted:

1. Get latitude & longitude
2. Fetch current weather
3. Generate recommendation

If denied:

Use manual mode.

Show:

```text
Select your weather
```

Options:

* Sunny
* Rainy
* Cold
* Hot

---

## Recommendation Logic

### Hot Weather

Example:

Temperature > 30°C

Recommend:

* Fruity Blend
* W. Yirgacheffe
* N. Shakiso

Message:

```text
Perfect for a bright and refreshing cup today.
```

---

### Mild Weather

Temperature 22-30°C

Recommend:

* Arabica Lâm Đồng
* Peru
* Colombia

Message:

```text
Balanced coffees for a comfortable day.
```

---

### Rainy Weather

Weather = Rain

Recommend:

* Deep Blue Blend
* Croissant Blend
* Brazil

Message:

```text
Comforting chocolate notes for a cozy rainy day.
```

---

### Cold Weather

Temperature < 22°C

Recommend:

* Robusta Honey
* Robusta 82 Blend
* Deep Blue Blend

Message:

```text
Rich body and sweetness for colder moments.
```

---

## Time-Based Recommendation Layer

Morning (05:00 - 11:00)

Recommend:

* Bright
* Fruity
* High acidity

---

Afternoon (11:00 - 17:00)

Recommend:

* Balanced
* Chocolate

---

Evening (17:00 - 22:00)

Recommend:

* Decaf
* Low acidity
* Smooth coffees

---

## UI Requirements

Create small recommendation card.

Position:

Above flavor selection.

Example:

```text
☀️ Today's Recommendation

28°C in your area

We recommend:
Fruity Blend
Peru

[Explore]
```

Requirements:

* Non-intrusive
* Mobile responsive
* Uses existing card design language

---

# Feature 2 - Brew Cost Calculator

## Business Goal

Increase transparency.

Help users understand brewing cost.

Useful for:

* Home brewers
* Café owners

---

## User Flow

Inside Coffee Detail Page.

Add section:

```text
Calculate Brew Cost
```

---

## Inputs

Coffee Weight

Example:

```text
18g
```

Editable.

---

Coffee Price

Auto-populated from selected bean.

---

Recipe Ratio

Example:

```text
1:16
```

Editable.

---

## Outputs

### Cost Per Brew

Example:

```text
12,400 VND
```

### Cost Per Cup

Example:

```text
1 serving
```

### Number of Cups Per Bag

Example:

```text
500g bag

≈ 27 cups
```

---

## Formula

```text
Cost Per Brew
=
Coffee Weight
×
Price Per Gram
```

---

## UI Requirements

Use compact calculator card.

Do NOT create modal.

Do NOT navigate away.

Should fit naturally inside product page.

---

# Feature 3 - Side-by-Side Coffee Comparison

## Business Goal

Help users choose between similar coffees.

Reduce uncertainty before purchase.

---

## User Flow

Every coffee card should have:

```text
Compare
```

button.

---

When user selects 2 coffees:

Open comparison panel.

---

## Comparison Layout

Desktop

```text
Coffee A | Coffee B
```

Two-column comparison.

---

Mobile

Stack vertically.

---

## Comparison Categories

### Origin

Example:

```text
Vietnam
vs
Ethiopia
```

---

### Roast Level

Example:

```text
Medium
vs
Light-Medium
```

---

### Flavor Notes

Example:

```text
Chocolate
Brown Sugar

vs

Tropical Fruit
Bergamot
```

---

### Recommended Brewing Methods

Example:

```text
Espresso
Milk Drinks

vs

Pour Over
Filter
```

---

### Acidity

Visual scale.

Example:

```text
Low ●○○○○ High
```

---

### Body

Visual scale.

Example:

```text
Light ●○○○○ Heavy
```

---

### Sweetness

Visual scale.

Example:

```text
Low ●○○○○ High
```

---

## UI Requirements

Use existing card style.

No table with borders.

No spreadsheet appearance.

Keep comparison elegant and clean.

---

# Technical Architecture

## New Services

```text
src/services/
├── weatherService.js
├── recommendationEngine.js
```

---

## New Components

```text
src/components/

├── WeatherRecommendation
├── BrewCostCalculator
├── CoffeeComparison
├── ComparisonDrawer
```

---

## New Hooks

```text
src/hooks/

├── useWeather
├── useRecommendation
```

---

# Performance Requirements

Weather API:

* Cache for 30 minutes
* Avoid repeated requests

Comparison:

* Maximum 2 coffees selected

Calculator:

* Instant update
* No API calls

---

# Accessibility Requirements

* Keyboard navigable
* Screen reader friendly
* Mobile friendly
* Responsive from 320px width

---

# Success Criteria

Users can:

✓ Discover coffee based on weather

✓ Understand brewing cost instantly

✓ Compare two coffees before purchasing

✓ Continue using existing brewing simulation

✓ Experience zero visual disruption

The website should remain familiar while becoming significantly more useful and conversion-focused.
