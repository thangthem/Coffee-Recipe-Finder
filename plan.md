# Coffee Recipe Finder - Implementation Specification

## Project Overview

Convert the existing Excel-based coffee recipe recommendation system into a modern web application using only:

* HTML5
* CSS3
* Vanilla Javascript (ES6+)
* GSAP (Animation)
* AOS (Scroll Animation)

No React, Vue, Angular, Backend, Database.

Application will run entirely on client-side using JSON data generated from the Excel file.

---

# Design Goals

Current Excel UX:

User selects:

* Tool
* Preference

Then receives:

* Coffee recommendation
* Recipe information

Problems:

* Feels like spreadsheet
* Poor visual hierarchy
* Not mobile friendly
* Hard to extend

Target UX:

A premium specialty coffee brewing assistant.

Inspired by:

* Blue Bottle
* Fellow Brew Timer
* Beanconqueror
* Apple product selection flow

---

# Technical Stack

## Frontend

HTML5
CSS3
Javascript ES6

## Animation

GSAP
AOS

## Storage

LocalStorage

## Data Source

recipes.json

No API required.

---

# Folder Structure

```text
project/

├── index.html

├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── layout.css
│   ├── components.css
│   └── animations.css

├── js/
│   ├── app.js
│   ├── state.js
│   ├── data-service.js
│   ├── ui-renderer.js
│   ├── modal.js
│   ├── timer.js
│   └── animation.js

├── data/
│   └── recipes.json

├── assets/
│   ├── images/
│   └── icons/

└── libs/
```

---

# Application Flow

## Step 1

Landing Screen

Display:

* Logo
* App Name
* Tagline
* Start Brewing button

Example:

Coffee Recipe Finder

Find the perfect brew for today.

[ Start Brewing ]

Animation:

* Fade in
* Scale in
* Stagger effect

---

## Step 2

Select Brewing Method

Title:

Choose Your Brewing Method

Display as cards:

* Phin
* Espresso
* Filter
* Cold Brew

Card Behaviour:

Hover:

* Lift up
* Shadow increase

Selected:

* Highlight border
* Active background

Animation:

GSAP stagger reveal

---

## Step 3

Select Taste Preference

Title:

What Flavor Profile Do You Prefer?

Cards:

* Fruity
* Balanced
* Strong

Each card contains:

* Icon
* Title
* Short description

Example:

Fruity

Bright acidity
Floral aroma

Balanced

Sweet
Nutty
Smooth

Strong

Bold
Dark chocolate
Heavy body

---

## Step 4

Coffee Recommendation

After selecting:

* Tool
* Preference

Filter recipe data.

Display result cards.

Each card contains:

* Coffee Name
* Origin
* Flavor Notes
* Recommendation Score

Card Layout:

---

Lâm Đồng Arabica

Chocolate
Nutty
Sweet

## View Recipe →

Animation:

GSAP stagger

---

## Step 5

Recipe Detail Modal

When user clicks a coffee card.

Open fullscreen modal.

Display:

Coffee Name

Tool

Ratio

Temperature

Grind Size

Water Quality

Brew Time

Milk Ratio

---

# Brew Timeline

Display brewing process visually.

Example:

●────●────●────●

Bloom
Pour
Pour
Finish

Each step shows:

* Step Name
* Water Amount
* Time Range

---

# Brew Timer

Button:

Start Brewing

Features:

* Countdown timer
* Step notifications
* Progress bar

Example:

00:00
Bloom

01:00
Pour #1

02:00
Pour #2

05:00
Finish

---

# Search Function

Search bar at top.

User can search:

* Coffee name
* Origin
* Flavor note

Real-time filtering.

---

# Favorite Feature

Allow users to:

* Save favorite recipes

Store in:

LocalStorage

Display:

Favorite icon on cards.

---

# Dark Theme

Default theme.

Color Palette:

Background:
#121212

Card:
#1E1E1E

Primary:
#C49A6C

Text:
#F8F8F8

Secondary:
#B8B8B8

Success:
#4CAF50

---

# Responsive Design

Mobile First

Breakpoints:

320px
375px
768px
1024px
1440px

---

# Data Structure

recipes.json

Example:

```json
[
  {
    "id": 1,
    "tool": "PHIN",
    "preference": "BALANCED",

    "coffee": {
      "name": "Lâm Đồng Arabica",
      "origin": "Vietnam",
      "notes": [
        "Chocolate",
        "Nutty",
        "Sweet"
      ]
    },

    "recipe": {
      "ratio": "1:5",
      "temperature": 96,
      "grind": "Medium",
      "waterPPM": "55-60",
      "brewTime": "5 min",
      "milkRatio": "1:2"
    },

    "steps": [
      {
        "name": "Bloom",
        "water": "50g",
        "start": 0,
        "end": 60
      },
      {
        "name": "Pour 1",
        "water": "50g",
        "start": 60,
        "end": 120
      }
    ]
  }
]
```

---

# State Management

Use simple Javascript object.

```javascript
const state = {
  selectedTool: null,
  selectedPreference: null,
  selectedRecipe: null,
  favorites: []
};
```

No Redux.
No framework.

---

# Required Components

LandingSection

ToolSelector

PreferenceSelector

RecommendationList

CoffeeCard

RecipeModal

BrewTimeline

BrewTimer

SearchBar

FavoriteButton

ToastNotification

LoadingOverlay

---

# Animation Requirements

Landing

* Fade In
* Scale In

Cards

* Hover Lift
* Hover Glow

Modal

* Slide Up
* Fade Background

Recommendation Results

* Stagger Reveal

Timeline

* Progressive Fill Animation

Buttons

* Ripple Effect

---

# Accessibility

Must support:

* Keyboard navigation
* Focus states
* ARIA labels
* Color contrast AA

---

# Deliverables

Generate:

1. index.html
2. All CSS files
3. All Javascript files
4. recipes.json sample
5. Responsive layout
6. GSAP integration
7. Favorite functionality
8. Brew timer functionality
9. Search functionality
10. Clean modular code

Code must be production-ready and easy to extend later.
