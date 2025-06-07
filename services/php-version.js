/**
 * Utilities relating to PHP version numbers. This compares version numbers
 * using the algorithm followed by Composer (see
 * https://getcomposer.org/doc/04-schema.md#version).
 *
 * @module
 */

import { fetch } from '../core/base-service/got.js'
import { getCachedResource } from '../core/base-service/resource-cache.js'
import { listCompare } from './version.js'
import { omitv } from './text-formatters.js'

/**
 * Return a negative value if v1 < v2,
 * zero if v1 = v2, a positive value otherwise.
 *
 * @param {string} v1 - First version for comparison
 * @param {string} v2 - Second version for comparison
 * @returns {number} Comparison result (-1, 0 or 1)
 */
function asciiVersionCompare(v1, v2) {
  if (v1 < v2) {
    return -1
  } else if (v1 > v2) {
    return 1
  } else {
    return 0
  }
}

/**
 * Take a version without the starting v.
 * eg, '1.0.x-beta'
 * Return { numbers: [1,0,something big], modifier: 2, modifierCount: 1 }
 *
 * @param {string} version - Version number string
 * @returns {object} Object containing version details
 */
function numberedVersionData(version) {
  // https://github.com/composer/semver/blob/46d9139568ccb8d9e7cdd4539cab7347568a5e2e/src/VersionParser.php#L39
  const regex =
    /^(\d+(?:\.\d+)*)(?:[._-]?(stable|beta|b|RC|alpha|a|patch|pl|p)?((?:[.-]?\d+)*)?)?([.-]?dev)?$/i
  const match = version.match(regex)

  if (!match || match.length < 5) {
    throw new Error(`Unparseable PHP version: ${version}`)
  }

  let modifierLevel = 3 // default: stable/without modifiers
  let modifierLevelCount = 0

  const modifier = match[2] ? match[2].toLowerCase() : ''
  const modifierCountStr = match[3] || ''
  const devModifier = match[4] ? match[4].toLowerCase() : ''

  // Normalization based on
  // https://github.com/composer/semver/blob/1.5.0/src/VersionParser.php
  if (modifier === 'alpha' || modifier === 'a') {
    modifierLevel = 0
    modifierLevelCount = +modifierCountStr.replace(/[^\d]/g, '') || 1
  } else if (modifier === 'beta' || modifier === 'b') {
    modifierLevel = 1
    modifierLevelCount = +modifierCountStr.replace(/[^\d]/g, '') || 1
  } else if (modifier === 'rc') {
    modifierLevel = 2
    modifierLevelCount = +modifierCountStr.replace(/[^\d]/g, '') || 1
  } else if (modifier === 'stable' || modifier === '') {
    modifierLevel = 3
    modifierLevelCount = 1
  } else if (modifier === 'patch' || modifier === 'pl' || modifier === 'p') {
    modifierLevel = 4
    modifierLevelCount = +modifierCountStr.replace(/[^\d]/g, '') || 1
  }

  if (devModifier) {
    modifierLevel = 5
    modifierLevelCount = 1
  }

  /**
   * Try to convert to a list of numbers.
   *
   * @param {string} s - Version number string
   * @returns {number} Version number integer
   */
  function toNum(s) {
    let n = +s
    if (Number.isNaN(n)) {
      n = 0xffffffff
    }
    return n
  }
  const numberList = match[1].split('.').map(toNum)

  return {
    numbers: numberList,
    modifier: modifierLevel,
    modifierCount: modifierLevelCount,
  }
}

/**
 * Compares two versions and return an integer based on the result.
 * See https://getcomposer.org/doc/04-schema.md#version
 * and https://github.com/badges/shields/issues/319#issuecomment-74411045
 *
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} Negative value if v1 < v2, zero if v1 = v2, else a positive value
 */
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

/**
 * Determines the latest version from a list of versions.
 *
 * @param {string[]} versions - List of versions
 * @returns {string} Latest version
 */
function latest(versions) {
  let latest = versions[0]
  for (let i = 1; i < versions.length; i++) {
    if (compare(latest, versions[i]) < 0) {
      latest = versions[i]
    }
  }
  return latest
}

/**
 * Determines if a version is stable or not.
 *
 * @param {string} version - Version number
 * @returns {boolean} true if version is stable, else false
 */
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

/**
 * Checks if a version is valid and returns the minor version.
 *
 * @param {string} version - Version number
 * @returns {string} Minor version
 */
function minorVersion(version) {
  const result = version.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/)

  if (result === null) {
    return ''
  }

  return `${result[1]}.${result[2] ? result[2] : '0'}`
}

/**
 * Reduces the list of php versions that intersect with release versions to a version range (for eg. '5.4 - 7.1', '>= 5.5').
 *
 * @param {string[]} versions - List of php versions
 * @param {string[]} phpReleases - List of php release versions
 * @returns {string[]} Reduced Version Range (for eg. ['5.4 - 7.1'], ['>= 5.5'])
 */
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

/**
 * Fetches the PHP release versions from cache if exists, else fetch from the source url and save in cache.
 *
 * @async
 * @param {object} githubApiProvider - Github API provider
 * @returns {Promise<*>} Promise that resolves to parsed response
 */
async function getPhpReleases(githubApiProvider) {
  return getCachedResource({
    url: '/repos/php/php-src/git/refs/tags',
    scraper: tags =>
      Array.from(
        new Set(
          tags
            // only releases
            .filter(
              tag => tag.ref.match(/^refs\/tags\/php-\d+\.\d+\.\d+$/) != null,
            )
            // get minor version of release
            .map(tag => tag.ref.match(/^refs\/tags\/php-(\d+\.\d+)\.\d+$/)[1]),
        ),
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
