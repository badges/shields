/**
 * Commonly-used functions for formatting text in badge labels. Includes
 * ordinal numbers, currency codes, star ratings, etc.
 */
'use strict';

const moment = require('moment');
moment().format();

function starRating(rating) {
  let stars = '';
  while (stars.length < rating) { stars += '★'; }
  while (stars.length < 5) { stars += '☆'; }
  return stars;
}

// Convert ISO 4217 code to unicode string.
function currencyFromCode(code) {
  return ({
    CNY: '¥',
    EUR: '€',
    GBP: '₤',
    USD: '$',
  })[code] || code;
}

function ordinalNumber(n) {
  const s=['ᵗʰ','ˢᵗ','ⁿᵈ','ʳᵈ'], v=n%100;
  return n+(s[(v-20)%10]||s[v]||s[0]);
}

// Given a number, string with appropriate unit in the metric system, SI.
// Note: numbers beyond the peta- cannot be represented as integers in JS.
const metricPrefix = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
const metricPower = metricPrefix
    .map(function(a, i) { return Math.pow(1000, i + 1); });
function metric(n) {
  for (let i = metricPrefix.length - 1; i >= 0; i--) {
    const limit = metricPower[i];
    if (n >= limit) {
      n = Math.round(n / limit);
      return ''+n + metricPrefix[i];
    }
  }
  return ''+n;
}

// Remove the starting v in a string.
function omitv(version) {
  if (version.charCodeAt(0) === 118) {
    return version.slice(1);
  }
  return version;
}

function maybePluralize(singular, countable, plural) {
  plural = plural || `${singular}s`;

  if (countable && countable.length === 1) {
    return singular;
  } else {
    return plural;
  }
}

function formatDate(d) {
  const date = moment(d);
  const dateString = date.calendar(null, {
    lastDay: '[yesterday]',
    sameDay: '[today]',
    lastWeek: '[last] dddd',
    sameElse: 'MMMM YYYY'
  });
  // Trim current year from date string
  return dateString.replace(` ${moment().year()}`, '').toLowerCase();
}

module.exports = {
  starRating,
  currencyFromCode,
  ordinalNumber,
  metric,
  omitv,
  maybePluralize,
  formatDate
};
