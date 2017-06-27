/**
 * Commonly-used functions for determining the colour to use for a badge,
 * including colours based off download count, version number, etc.
 */
'use strict';

function versionColor(version) {
  // http://semver.org/#spec-item-4
  const initial = /^v?0/.test(version);
  // http://semver.org/#spec-item-9
  const preRelease = /-/.test(version);
  return initial || preRelease ? 'orange' : 'blue';
}
exports.versionColor = versionColor;

function downloadCount(downloads) {
  return floorCount(downloads, 10, 100, 1000);
}
exports.downloadCount = downloadCount;

function reviewCount(reviews) {
  return floorCount(reviews, 5, 50, 500);
}
exports.reviewCount = reviewCount;

function coveragePercentage(percentage) {
  return floorCount(percentage, 80, 90, 100);
}
exports.coveragePercentage = coveragePercentage;

function floorCount(value, yellow, yellowgreen, green) {
  if (value === 0) {
    return 'red';
  } else if (value < yellow) {
    return 'yellow';
  } else if (value < yellowgreen) {
    return 'yellowgreen';
  } else if (value < green) {
    return 'green';
  } else {
    return 'brightgreen';
  }
}
exports.floorCount = floorCount;
