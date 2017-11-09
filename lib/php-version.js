/**
 * Utilities relating to PHP version numbers. This compares version numbers
 * using the algorithm followed by Composer (see
 * https://getcomposer.org/doc/04-schema.md#version).
 */
'use strict';

const {listCompare} = require('./version.js');
const {omitv} = require('./text-formatters.js');

// Return a negative value if v1 < v2,
// zero if v1 = v2,
// a positive value otherwise.
//
// See https://getcomposer.org/doc/04-schema.md#version
// and https://github.com/badges/shields/issues/319#issuecomment-74411045
function compare(v1, v2) {
  // Omit the starting `v`.
  const rawv1 = omitv(v1);
  const rawv2 = omitv(v2);
  let v1data, v2data;
  try {
    v1data = numberedVersionData(rawv1);
    v2data = numberedVersionData(rawv2);
  } catch(e) {
    return asciiVersionCompare(rawv1, rawv2);
  }

  // Compare the numbered part (eg, 1.0.0 < 2.0.0).
  const numbersCompare = listCompare(v1data.numbers, v2data.numbers);
  if (numbersCompare !== 0) {
    return numbersCompare;
  }

  // Compare the modifiers (eg, alpha < beta).
  if (v1data.modifier < v2data.modifier) {
    return -1;
  } else if (v1data.modifier > v2data.modifier) {
    return 1;
  }

  // Compare the modifier counts (eg, alpha1 < alpha3).
  if (v1data.modifierCount < v2data.modifierCount) {
    return -1;
  } else if (v1data.modifierCount > v2data.modifierCount) {
    return 1;
  }

  return 0;
}
exports.compare = compare;

function latest(versions) {
  let latest = versions[0];
  for (let i = 1; i < versions.length; i++) {
    if (compare(latest, versions[i]) < 0) {
      latest = versions[i];
    }
  }
  return latest;
}
exports.latest = latest;

// Whether a version is stable.
function isStable(version) {
  const rawVersion = omitv(version);
  let versionData;
  try {
    versionData = numberedVersionData(rawVersion);
  } catch(e) {
    return false;
  }
  // normal or patch
  return (versionData.modifier === 3) || (versionData.modifier === 4);
}
exports.isStable = isStable;

// === Private helper functions ===

// Return a negative value if v1 < v2,
// zero if v1 = v2, a positive value otherwise.
function asciiVersionCompare(v1, v2) {
  if (v1 < v2) {
    return -1;
  } else if (v1 > v2) {
    return 1;
  } else {
    return 0;
  }
}

// Take a version without the starting v.
// eg, '1.0.x-beta'
// Return { numbers: [1,0,something big], modifier: 2, modifierCount: 1 }
function numberedVersionData(version) {
  // A version has a numbered part and a modifier part
  // (eg, 1.0.0-patch, 2.0.x-dev).
  const parts = version.split('-');
  const numbered = parts[0];

  // Aliases that get caught here.
  if (numbered === 'dev') {
    return {
      numbers: parts[1],
      modifier: 5,
      modifierCount: 1,
    };
  }

  let modifierLevel = 3;
  let modifierLevelCount = 0;

  if (parts.length > 1) {
    const modifier = parts[parts.length - 1];
    const firstLetter = modifier.charCodeAt(0);
    let modifierLevelCountString;

    // Modifiers: alpha < beta < RC < normal < patch < dev
    if (firstLetter === 97) { // a
      modifierLevel = 0;
      if (/^alpha/.test(modifier)) {
        modifierLevelCountString = + (modifier.slice(5));
      } else {
        modifierLevelCountString = + (modifier.slice(1));
      }
    } else if (firstLetter === 98) { // b
      modifierLevel = 1;
      if (/^beta/.test(modifier)) {
        modifierLevelCountString = + (modifier.slice(4));
      } else {
        modifierLevelCountString = + (modifier.slice(1));
      }
    } else if (firstLetter === 82) { // R
      modifierLevel = 2;
      modifierLevelCountString = + (modifier.slice(2));
    } else if (firstLetter === 112) { // p
      modifierLevel = 4;
      if (/^patch/.test(modifier)) {
        modifierLevelCountString = + (modifier.slice(5));
      } else {
        modifierLevelCountString = + (modifier.slice(1));
      }
    } else if (firstLetter === 100) { // d
      modifierLevel = 5;
      if (/^dev/.test(modifier)) {
        modifierLevelCountString = + (modifier.slice(3));
      } else {
        modifierLevelCountString = + (modifier.slice(1));
      }
    }

    // If we got the empty string, it defaults to a modifier count of 1.
    if (!modifierLevelCountString) {
      modifierLevelCount = 1;
    } else {
      modifierLevelCount = + modifierLevelCountString;
    }
  }

  // Try to convert to a list of numbers.
  function toNum (s) {
    let n = +s;
    if (Number.isNaN(n)) {
      n = 0xffffffff;
    }
    return n;
  }
  const numberList = numbered.split('.').map(toNum);

  return {
    numbers: numberList,
    modifier: modifierLevel,
    modifierCount: modifierLevelCount,
  };
}

function isHhvm(version) {
  return version.indexOf('hhvm') === 0;
}
exports.isHhvm = isHhvm;

function isEqual(array1, array2) {
  return array1.length === array2.length && array1.every(function(v, i) {
    return v === array2[i];
  });
}

function buildVersionMap(versions) {
  const map = {};

  for (const index in versions) {
    const numbers = versions[index].split('.');
    if (!(numbers[0] in map)) {
      map[numbers[0]] = [];
    }
    if (typeof numbers[1] !== 'undefined') {
      numbers[1] = parseInt(numbers[1]);
    } else {
      numbers[1] = 0;
    }
    if (map[numbers[0]].indexOf(numbers[1]) === -1) {
      map[numbers[0]].push(numbers[1]);
      map[numbers[0]].sort();
    }
  }

  return map;
}

function versionReduction(versions) {
  if (!versions) {
    return '';
  }

  const map = buildVersionMap(versions);
  const phpReleases = {
    '5': [2, 3, 4, 5, 6],
    '7': [0, 1, 2],
  };

  const php5 = {
    first: '5' in map ? map['5'][0] : null,
    last:  '5' in map ? map['5'][map['5'].length - 1] : null,
  };
  const php7 = {
    first: '7' in map ? map['7'][0] : null,
    last:  '7' in map ? map['7'][map['7'].length - 1] : null,
  };

  // 5.x and 7.x
  if ('5' in map && '7' in map) {
    const php5Slice = phpReleases['5'].slice(phpReleases['5'].indexOf(php5.first));
    const php7Slice = phpReleases['7'].slice(0, phpReleases['7'].indexOf(php7.last) + 1);

    if (isEqual(php5Slice, map['5']) && isEqual(map['7'], phpReleases['7'])) { // test in all
      return '>= 5.' + php5.first;
    }

    if (isEqual(php5Slice, map['5']) && isEqual(php7Slice, map['7'])) {
      return '5.' + php5.first + ' - 7.' + php7.last;
    }

    return map['5'].map(function(number) {
      return '5.' + number;
    }).concat(map['7'].map(function(number) {
      return '7.' + number;
    })).join(', ');
  }

  // only 5.x
  if ('5' in map) {
      const php5Slice = phpReleases['5'].slice(
          phpReleases['5'].indexOf(php5.first),
          phpReleases['5'].indexOf(php5.last) + 1
      );

      if (map['5'].length > 1 && isEqual(map['5'], php5Slice)) {
          return '5.' + php5.first + ' - 5.' + php5.last;
      }
      return map['5'].map(function(number) {
          return '5.' + number;
      }).join(', ');
  }

  // only 7.x
  if ('7' in map) {
      const php7Slice = phpReleases['7'].slice(phpReleases['7'].indexOf(php7.first));
      if (isEqual(map['7'], phpReleases['7'])) { // test in all
          return '>= 7';
      }
      if (isEqual(map['7'], php7Slice)) {
          return '>= 7.' + php7.first;
      }
      return map['7'].map(function(number) {
          return '7.' + number;
      }).join(', ');
  }

  return '';
}
exports.versionReduction = versionReduction;
