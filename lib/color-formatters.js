/**
 * Commonly-used functions for determining the colour to use for a badge,
 * including colours based off download count, version number, etc.
 */
'use strict';

function versionFormatter(version) {
  var first = version[0];
  if (first === 'v') {
    first = version[1];
  } else if (/^[0-9]/.test(version)) {
    version = 'v' + version;
  }
  if (first === '0' || (version.indexOf('-') !== -1)) {
    return { version: version, color: 'orange' };
  } else {
    return { version: version, color: 'blue' };
  }
}
exports.version = versionFormatter;

function downloadCount(downloads) {
  return floorCount(downloads, 10, 100, 1000);
}
exports.downloadCount = downloadCount;

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
