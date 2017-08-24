/**
 * Commonly-used functions for formatting text in badge labels. Includes
 * ordinal numbers, star ratings, etc.
 */

'use strict';

const assert = require('assert');

function versionString(version) {
  const prefix = /^[0-9]/.test(version) ? 'v' : '';
  return prefix + version;
}
exports.versionString = versionString;

function starRating(rating) {
  assert(rating >= 0);
  assert(rating <= 5);
  const stars = Math.round(rating);
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}
exports.starRating = starRating;

function fractionRating(rating) {
  return Math.round(100 * rating) / 100 + '/5';
}
exports.fractionRating = fractionRating;

function ordinalNumber(n) {
  var s=["ᵗʰ","ˢᵗ","ⁿᵈ","ʳᵈ"], v=n%100;
  return n+(s[(v-20)%10]||s[v]||s[0]);
}
exports.ordinalNumber = ordinalNumber;

// Given a number, string with appropriate unit in the metric system, SI.
// Note: numbers beyond the peta- cannot be represented as integers in JS.
function metric(n) {
  assert(n >= 0);
  const prefix = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  const power = n == 0 ? 0 : Math.floor(Math.log(n) / Math.log(1000));
  return Math.round(n / Math.pow(1000, power)) + prefix[power];
}
exports.metric = metric;
