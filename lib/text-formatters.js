/**
 * Commonly-used functions for formatting text in badge labels. Includes
 * ordinal numbers, currency codes, star ratings, etc.
 */
'use strict';

function starRating(rating) {
  var stars = '';
  while (stars.length < rating) { stars += '★'; }
  while (stars.length < 5) { stars += '☆'; }
  return stars;
}
exports.starRating = starRating;

// Convert ISO 4217 code to unicode string.
function currencyFromCode(code) {
  return ({
    CNY: '¥',
    EUR: '€',
    GBP: '₤',
    USD: '$',
  })[code] || code;
}
exports.currencyFromCode = currencyFromCode;

function ordinalNumber(n) {
  var s=["ᵗʰ","ˢᵗ","ⁿᵈ","ʳᵈ"], v=n%100;
  return n+(s[(v-20)%10]||s[v]||s[0]);
}
exports.ordinalNumber = ordinalNumber;

// Given a number, string with appropriate unit in the metric system, SI.
// Note: numbers beyond the peta- cannot be represented as integers in JS.
var metricPrefix = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
var metricPower = metricPrefix
    .map(function(a, i) { return Math.pow(1000, i + 1); });
function metric(n) {
  for (var i = metricPrefix.length - 1; i >= 0; i--) {
    var limit = metricPower[i];
    if (n >= limit) {
      n = Math.round(n / limit);
      return ''+n + metricPrefix[i];
    }
  }
  return ''+n;
}
exports.metric = metric;
