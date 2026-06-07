# Coffee Recipe Finder - UI/UX Refactor Plan

## Objective

Refactor the current Coffee Recipe Finder website into a coffee discovery and purchasing experience while preserving the existing visual identity.

### Important Constraints

* DO NOT change the current design language.
* DO NOT change existing color palette.
* DO NOT change fonts.
* DO NOT change overall branding style.
* DO NOT redesign into another theme.
* Keep the current visual atmosphere and aesthetic.
* Only improve user flow and information architecture.

---

# Current Problem

Current user flow:

```text
Select Brewing Tool
    ↓
Select Recipe
    ↓
View Coffee
```

This flow is suitable for coffee enthusiasts but not suitable for:

* New customers
* Retail customers
* Wholesale customers
* Customers who don't know brewing equipment

Most customers think:

"I like chocolate flavor coffee"

instead of:

"I have a V60"

---

# New User Flow

Replace current flow with:

```text
Select Flavor Profile
    ↓
View Recommended Coffee Beans
    ↓
View Coffee Details
    ↓
View Brewing Recipes
    ↓
Purchase / Contact
```

---

# Homepage Structure

## Section 1 - Hero

Keep existing hero style.

Only update content.

Example:

Title:

```text
Find Your Perfect Coffee
```

Subtitle:

```text
Discover coffee beans based on your taste preference.
```

Primary CTA:

```text
Explore Coffee
```

---

## Section 2 - Flavor Selection

Replace "Brewing Tool Selection".

Create flavor cards.

### Flavor Categories

#### Chocolate & Nutty

Keywords:

* Chocolate
* Caramel
* Brown Sugar
* Nuts

#### Fruity

Keywords:

* Cherry
* Berry
* Tropical Fruit
* Raisin

#### Bright & Citrus

Keywords:

* Lemon
* Orange
* Green Apple

#### Floral & Tea-like

Keywords:

* Bergamot
* Floral
* Tea

### Requirements

* Use existing card style.
* Use existing hover effect.
* Use existing animation system.
* Responsive on mobile.

---

# Coffee Bean Catalog

After selecting a flavor profile, show matching coffee beans.

Each coffee bean should be displayed as a product card.

Card content:

```text
Coffee Name

Origin
Roast Level
Flavor Notes

[View Details]
```

---

# Coffee Detail Page / Modal

Display:

## Basic Information

* Product Name
* Origin
* Roast Level
* Processing Method
* Flavor Notes

## Recommended Usage

Examples:

* Espresso
* Milk Based Drinks
* Pour Over
* Vietnamese Phin

---

# Pricing Section

Add pricing section.

## Retail Price

Show retail prices.

Example:

```text
250g
500g
1kg
```

Use selectable buttons/tabs.

Example:

[250g] [500g] [1kg]

Price updates dynamically.

---

## Wholesale Price

Do NOT display full wholesale pricing table.

Instead display:

```text
Need wholesale pricing?

Available for cafés and businesses.
```

Buttons:

```text
Contact via Messenger
Contact via Zalo
```

Requirements:

* Open external links.
* Open in new tab.
* Easy to find.
* Mobile friendly.

---

# Brewing Recipes

Keep existing brewing simulation concept.

This is an important feature.

DO NOT remove recipe functionality.

Move recipe section below coffee detail.

Flow:

```text
Flavor
    ↓
Coffee Bean
    ↓
Recipe
```

instead of:

```text
Tool
    ↓
Recipe
```

---

# Coffee Data Mapping

Create flavor mapping.

Example:

## Chocolate & Nutty

* Arabica Lâm Đồng
* Deep Blue Blend
* Robusta Honey
* Robusta 82 Blend
* Croissant Blend
* Brazil

## Fruity

* Fruity Blend
* W. Yirgacheffe
* N. Shakiso

## Bright & Citrus

* Peru
* Arabica Lâm Đồng
* W. Yirgacheffe

## Floral & Tea

* N. Shakiso
* Liberia
* Specialty Coffee

This mapping should be stored in a configuration file.

Example:

```javascript
coffeeProfiles.js
```

Avoid hardcoding inside components.

---

# Technical Requirements

## Keep Existing

* Existing theme
* Existing colors
* Existing typography
* Existing animations
* Existing responsiveness
* Existing recipe engine

## Refactor

* Component structure
* User flow
* Data architecture

---

# Suggested Folder Structure

```text
src/
├── data/
│   ├── coffees.js
│   ├── flavorProfiles.js
│
├── components/
│   ├── Hero
│   ├── FlavorSelector
│   ├── CoffeeCatalog
│   ├── CoffeeCard
│   ├── CoffeeDetail
│   ├── PricingSection
│   ├── RecipeSection
│   └── ContactWholesale
```

---

# UX Goals

The user should be able to:

1. Select preferred flavor.
2. Discover matching coffee.
3. View coffee details.
4. View brewing recipes.
5. Purchase retail coffee.
6. Contact for wholesale coffee.

without needing knowledge of brewing equipment.

---

# Success Criteria

* Existing visual identity preserved.
* Existing brewing simulation preserved.
* User flow simplified.
* Mobile experience improved.
* Retail conversion improved.
* Wholesale inquiries easier via Messenger and Zalo.
* Coffee discovery becomes flavor-first instead of tool-first.

```
```
