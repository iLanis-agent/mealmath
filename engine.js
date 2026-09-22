/* MealMath engine - pure functions for scaling recipe quantities into kitchen fractions. */
(function (root) {
  'use strict';

  // "1 1/2" -> 1.5, "3/4" -> .75, "2" -> 2, "2.5" -> 2.5; null when no leading quantity
  function parseQty(s) {
    s = (s || '').trim();
    var m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);      // mixed: 1 1/2
    if (m) return { qty: parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10), rest: s.slice(m[0].length).trim() };
    m = s.match(/^(\d+)\s*\/\s*(\d+)/);                    // fraction: 3/4
    if (m) return { qty: parseInt(m[1], 10) / parseInt(m[2], 10), rest: s.slice(m[0].length).trim() };
    m = s.match(/^(\d+(?:\.\d+)?)/);                       // whole or decimal
    if (m) return { qty: parseFloat(m[1]), rest: s.slice(m[1].length).trim() };
    return null;
  }

  // "2 cups flour" -> {qty, unit, name}; no qty -> {qty:null, raw}
  function parseLine(line) {
    line = (line || '').trim();
    if (!line) return null;
    var p = parseQty(line);
    if (!p) return { qty: null, raw: line };
    var parts = p.rest.split(/\s+/);
    var unit = parts.length > 1 ? parts[0] : '';
    var name = parts.length > 1 ? parts.slice(1).join(' ') : parts.join(' ');
    return { qty: p.qty, unit: unit, name: name };
  }

  var FRACS = [[1,8],[1,4],[1,3],[3,8],[1,2],[5,8],[2,3],[3,4],[7,8]];

  // snap a positive number to whole + nearest kitchen eighth; "1 1/3", "2/3", "3", "1/8"
  function formatQty(v) {
    if (!isFinite(v) || v <= 0) return '0';
    var whole = Math.floor(v + 1e-9);
    var frac = v - whole;
    var best = null, bestD = Infinity;
    FRACS.forEach(function (f) {
      var d = Math.abs(frac - f[0] / f[1]);
      if (d < bestD) { bestD = d; best = f; }
    });
    var snap0 = frac, snap1 = 1 - frac;
    if (snap0 <= bestD) { // closer to whole down
      if (whole === 0) return '1/8'; // tiny pinch, never show 0
      return String(whole);
    }
    if (snap1 <= bestD) return String(whole + 1);
    var n = best[0], dnom = best[1];
    var g = gcd(n, dnom); n /= g; dnom /= g;
    var f = n + '/' + dnom;
    return whole > 0 ? whole + ' ' + f : f;
  }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }

  function scaleIngredient(ing, factor) {
    if (!isFinite(factor) || factor <= 0) throw new Error('factor must be positive');
    if (ing.qty === null) return { qty: null, text: ing.raw };
    var scaled = ing.qty * factor;
    return { qty: scaled, text: formatQty(scaled) + (ing.unit ? ' ' + ing.unit : '') + (ing.name ? ' ' + ing.name : '') };
  }

  function scaleRecipe(lines, fromServings, toServings) {
    fromServings = Number(fromServings); toServings = Number(toServings);
    if (!isFinite(fromServings) || fromServings <= 0 || !isFinite(toServings) || toServings <= 0) {
      throw new Error('servings must be positive');
    }
    var factor = toServings / fromServings;
    return lines.map(parseLine).filter(function (x) { return x !== null; })
      .map(function (ing) { return scaleIngredient(ing, factor); });
  }

  var api = { parseQty: parseQty, parseLine: parseLine, formatQty: formatQty, scaleIngredient: scaleIngredient, scaleRecipe: scaleRecipe };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MealMath = api;
})(typeof window !== 'undefined' ? window : this);
