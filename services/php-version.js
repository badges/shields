/**
 * Utilities relating to PHP version numbers. This compares version numbers
 * using the algorithm followed by Composer (see
 * https://getcomposer.org/doc/04-schema.md#version).
 */
import { fetch } from '../core/base-service/got.js'
import { getCachedResource } from '../core/base-service/resource-cache.js'
import { listCompare } from './version.js'
import { omitv } from './text-formatters.js'

// Return a negative value if v1 < v2,
// zero if v1 = v2, a positive value otherwise.
function asciiVersionCompare(v1, v2) {
  if (v1 < v2) {
    return -1
  } else if (v1 > v2) {
    return 1
  } else {
    return 0
  }
}

// Take a version without the starting v.
// eg, '1.0.x-beta'
// Return { numbers: [1,0,something big], modifier: 2, modifierCount: 1 }
function numberedVersionData(version) {
  // A version has a numbered part and a modifier part
  // (eg, 1.0.0-patch, 2.0.x-dev).
  const parts = version.split('-')
  const numbered = parts[0]

  // Aliases that get caught here.
  if (numbered === 'dev') {
    return {
      numbers: parts[1],
      modifier: 5,
      modifierCount: 1,
    }
  }

  let modifierLevel = 3
  let modifierLevelCount = 0

  // Normalization based on
  // https://github.com/composer/semver/blob/1.5.0/src/VersionParser.php

  if (parts.length > 1) {
    const modifier = parts[parts.length - 1]
    const firstLetter = modifier.charCodeAt(0)
    let modifierLevelCountString

    // Modifiers: alpha < beta < RC < normal < patch < dev
    if (firstLetter === 97 || firstLetter === 65) {
      // a / A
      modifierLevel = 0
      if (/^alpha/i.test(modifier)) {
        modifierLevelCountString = +modifier.slice(5)
      } else {
        modifierLevelCountString = +modifier.slice(1)
      }
    } else if (firstLetter === 98 || firstLetter === 66) {
      // b / B
      modifierLevel = 1
      if (/^beta/i.test(modifier)) {
        modifierLevelCountString = +modifier.slice(4)
      } else {
        modifierLevelCountString = +modifier.slice(1)
      }
    } else if (firstLetter === 82 || firstLetter === 114) {
      // R / r
      modifierLevel = 2
      modifierLevelCountString = +modifier.slice(2)
    } else if (firstLetter === 112) {
      // p
      modifierLevel = 4
      if (/^patch/.test(modifier)) {
        modifierLevelCountString = +modifier.slice(5)
      } else {
        modifierLevelCountString = +modifier.slice(1)
      }
    } else if (firstLetter === 100) {
      // d
      modifierLevel = 5
      if (/^dev/.test(modifier)) {
        modifierLevelCountString = +modifier.slice(3)
      } else {
        modifierLevelCountString = +modifier.slice(1)
      }
    }

    // If we got the empty string, it defaults to a modifier count of 1.
    if (!modifierLevelCountString) {
      modifierLevelCount = 1
    } else {
      modifierLevelCount = +modifierLevelCountString
    }
  }

  // Try to convert to a list of numbers.
  function toNum(s) {
    let n = +s
    if (Number.isNaN(n)) {
      n = 0xffffffff
    }
    return n
  }
  const numberList = numbered.split('.').map(toNum)

  return {
    numbers: numberList,
    modifier: modifierLevel,
    modifierCount: modifierLevelCount,
  }
}

// Return a negative value if v1 < v2,
// zero if v1 = v2,
// a positive value otherwise.
//
// See https://getcomposer.org/doc/04-schema.md#version
// and https://github.com/badges/shields/issues/319#issuecomment-74411045
function compare(v1, v2) {
  // Omit the starting `v`.
  const rawv1 = omitv(v1)
  const rawv2 = omitv(v2)
  let v1data, v2data
  try {
    v1data = numberedVersionData(rawv1)
    v2data = numberedVersionData(rawv2)
  } catch (e) {
    return asciiVersionCompare(rawv1, rawv2)
  }

  // Compare the numbered part (eg, 1.0.0 < 2.0.0).
  const numbersCompare = listCompare(v1data.numbers, v2data.numbers)
  if (numbersCompare !== 0) {
    return numbersCompare
  }

  // Compare the modifiers (eg, alpha < beta).
  if (v1data.modifier < v2data.modifier) {
    return -1
  } else if (v1data.modifier > v2data.modifier) {
    return 1
  }

  // Compare the modifier counts (eg, alpha1 < alpha3).
  if (v1data.modifierCount < v2data.modifierCount) {
    return -1
  } else if (v1data.modifierCount > v2data.modifierCount) {
    return 1
  }

  return 0
}

function latest(versions) {
  let latest = versions[0]
  for (let i = 1; i < versions.length; i++) {
    if (compare(latest, versions[i]) < 0) {
      latest = versions[i]
    }
  }
  return latest
}

function isStable(version) {
  const rawVersion = omitv(version)
  let versionData
  try {
    versionData = numberedVersionData(rawVersion)
  } catch (e) {
    return false
  }
  // normal or patch
  return versionData.modifier === 3 || versionData.modifier === 4
}

function minorVersion(version) {
  const result = version.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/)

  if (result === null) {
    return ''
  }

  return `${result[1]}.${result[2] ? result[2] : '0'}`
}

function versionReduction(versions, phpReleases) {
  if (!versions.length) {
    return []
  }

  // versions intersect
  versions = Array.from(new Set(versions))
    .filter(n => phpReleases.includes(n))
    .sort()

  // nothing to reduction
  if (versions.length < 2) {
    return versions
  }

  const first = phpReleases.indexOf(versions[0])
  const last = phpReleases.indexOf(versions[versions.length - 1])

  // no missed versions
  if (first + versions.length - 1 === last) {
    if (last === phpReleases.length - 1) {
      return [`>= ${versions[0][2] === '0' ? versions[0][0] : versions[0]}`] // 7.0 -> 7
    }

    return [`${versions[0]} - ${versions[versions.length - 1]}`]
  }

  return versions
}

async function getPhpReleases(githubApiProvider) {
  return getCachedResource({
    url: '/repos/php/php-src/git/refs/tags',
    scraper: tags =>
      Array.from(
        new Set(
          tags
            // only releases
            .filter(
              tag => tag.ref.match(/^refs\/tags\/php-\d+\.\d+\.\d+$/) != null
            )
            // get minor version of release
            .map(tag => tag.ref.match(/^refs\/tags\/php-(\d+\.\d+)\.\d+$/)[1])
        )
      ),
    requestFetcher: githubApiProvider.fetch.bind(githubApiProvider, fetch),
  })
}

export {
  compare,
  latest,
  isStable,
  minorVersion,
  versionReduction,
  getPhpReleases,
}
