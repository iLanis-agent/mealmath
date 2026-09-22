# MealMath

Scale any recipe to any servings, in real kitchen fractions.

**Startup idea:** recipes almost never match your headcount, and scaling "1 1/2 tsp" by 1.5 in your head produces nonsense decimals. MealMath parses ingredient lines (mixed numbers, fractions, decimals, free text), scales every quantity, and snaps the results to the fractions cooks actually use - eighths, thirds, halves.

## Use

Open `app.html`. Paste ingredients one per line ("2 cups flour", "3 eggs", "salt to taste"), set original and target servings, hit Scale. Lines without quantities pass through untouched. One-tap presets for x0.5, x2, x3. Last recipe persists in localStorage.

## Engine

`engine.js` holds the pure logic (quantity parsing, nearest-eighth snapping with thirds, recipe scaling) and is covered by node tests. The UI is a thin render layer over it.

Part of the hourly app factory - 60+ small tools, one per hour.
