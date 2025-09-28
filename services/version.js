/**
 * Utilities relating to generating badges relating to version numbers. Includes
 * comparing versions to determine the latest, and determining the color to use
 * for the badge based on whether the version is a stable release.
 * For utilities specific to PHP version ranges, see php-version.js.
 *
 * @module
 */

import semver from 'semver'
import { addv } from './text-formatters.js'
import { version as versionColor } from './color-formatters.js'

/**
 * Compares two arrays of numbers lexicographically and returns an integer value.
 *
 * @param {number[]} a - The first array to compare
 * @param {number[]} b - The second array to compare
 * @returns {number} -1 if a is smaller than b, 1 if a is larger than b, 0 if a and b are equal
 * @example
 * listCompare([1, 2, 3], [1, 2, 4]) // returns -1 because the third element of the first array is smaller than the third element of the second array.
 */
function listCompare(a, b) {
  const alen = a.length
  const blen = b.length
  for (let i = 0; i < alen; i++) {
    if (a[i] < b[i]) {
      return -1
    } else if (a[i] > b[i]) {
      return 1
    }
  }
  return alen - blen
}

/**
 * Compares two strings representing version numbers lexicographically and returns an integer value.
 *
 * @param {string} v1 - The first version to compare
 * @param {string} v2 - The second version to compare
 * @returns {number} -1 if v1 is smaller than v2, 1 if v1 is larger than v2, 0 if v1 and v2 are equal
 * @example
 * compareDottedVersion('1.2.3', '1.2.4') // returns -1 because numeric part of first version is smaller than the numeric part of second version.
 */
function compareDottedVersion(v1, v2) {
  const parts1 = /([0-9.]+)(.*)$/.exec(v1)
  const parts2 = /([0-9.]+)(.*)$/.exec(v2)
  if (parts1 != null && parts2 != null) {
    const numbers1 = parts1[1]
    const numbers2 = parts2[1]
    const distinguisher1 = parts1[2]
    const distinguisher2 = parts2[2]
    const numlist1 = numbers1.split('.').map(e => +e)
    const numlist2 = numbers2.split('.').map(e => +e)
    const cmp = listCompare(numlist1, numlist2)
    if (cmp !== 0) {
      return cmp
    } else {
      return distinguisher1 < distinguisher2
        ? -1
        : distinguisher1 > distinguisher2
          ? 1
          : 0
    }
  }
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0
}

/**
 * Finds the largest version number lexicographically from an array of strings representing version numbers and returns it as a string.
 *
 * @param {string[]} versions - The array of version numbers to compare
 * @returns {string|undefined} The largest version number as a string, or undefined if the array is empty
 * @example
 * latestDottedVersion(['1.2.3', '1.2.4', '1.3', '2.0']) // returns '2.0' because it is the largest version number in the array.
 * latestDottedVersion([]) // returns undefined because the array is empty.
 */
function latestDottedVersion(versions) {
  const len = versions.length
  if (len === 0) {
    return
  }
  let version = versions[0]
  for (let i = 1; i < len; i++) {
    if (compareDottedVersion(version, versions[i]) < 0) {
      version = versions[i]
    }
  }
  return version
}

/**
 * Finds the largest version number lexicographically or semantically from an array of strings representing version numbers and returns it as a string.
 * latestMaybeSemVer() is used for versions that match some kind of dotted version pattern.
 *
 * @param {string[]} versions - The array of version numbers to compare
 * @param {boolean} pre - Whether to include pre-release versions or not
 * @returns {string|undefined} The largest version number as a string, or undefined if the array is empty
 * @example
 * latestMaybeSemVer(['1.2.3', '1.2.4', '1.3', '2.0'], false) // returns '2.0' because it is the largest version number and pre-release versions are excluded.
 * latestMaybeSemVer(['1.2.3', '1.2.4', '1.3', '2.0'], true) // returns '2.0' because pre-release versions are included but none of them are present in the array.
 * latestMaybeSemVer(['1.2.3', '1.2.4', '1.3-alpha', '2.0-beta'], false) // returns '1.2.4' because pre-release versions are excluded and it is the largest version number among the remaining ones.
 * latestMaybeSemVer(['1.2.3', '1.2.4', '1.3-alpha', '2.0-beta'], true) // returns '2.0-beta' because pre-release versions are included and it is the largest version number.
 */
function latestMaybeSemVer(versions, pre) {
  let version = ''

  if (!pre) {
    // remove pre-releases from array
    versions = versions.filter(version => !/\d+-\w+/.test(version))
  }
  try {
    // coerce to string then lowercase otherwise alpha > RC
    version = versions.sort((a, b) =>
      semver.compareBuild(
        `${a}`.toLowerCase(),
        `${b}`.toLowerCase(),
        /* loose */ true,
      ),
    )[versions.length - 1]
  } catch (e) {
    version = latestDottedVersion(versions)
  }
  return version
}

/**
 * Finds the largest version number lexicographically or semantically from an array of strings representing version numbers and returns it as a string.
 * latest() is looser than latestMaybeSemVer() as it will attempt to make sense of anything, falling back to alphabetic sorting.
 * We should ideally prefer latest() over latestMaybeSemVer() when adding version badges.
 *
 * @param {string[]} versions - The array of version numbers to compare
 * @param {object} [options] - An optional object that contains additional options
 * @param {boolean} [options.pre=false] - Whether to include pre-release versions or not, defaults to false
 * @returns {string|undefined} The largest version number as a string, or undefined if the array is empty
 * @example
 * latest(['1.2.3', '1.2.4', '1.3', '2.0'], { pre: false }) // returns '2.0' because it is the largest version number and pre-release versions are excluded.
 * latest(['1.2.3', '1.2.4', '1.3', '2.0'], { pre: true }) // returns '2.0' because pre-release versions are included but none of them are present in the array.
 * latest(['1.2.3', '1.2.4', '1.3-alpha', '2.0-beta'], { pre: false }) // returns '1.2.4' because pre-release versions are excluded and it is the largest version number among the remaining ones.
 * latest(['1.2.3', '1.2.4', '1.3-alpha', '2.0-beta'], { pre: true }) // returns '2.0-beta' because pre-release versions are included and it is the largest version number.
 */
function latest(versions, { pre = false } = {}) {
  let version = ''
  let origVersions = versions

  // return all results that are likely semver compatible versions
  versions = origVersions.filter(version => /\d+\.\d+/.test(version))
  // If no semver versions then look for single numbered versions
  if (!versions.length) {
    versions = origVersions.filter(version => /\d+/.test(version))
  }

  version = latestMaybeSemVer(versions, pre)

  if (version == null && !pre) {
    version = latestMaybeSemVer(versions, true)
  }

  // if we've still got nothing,
  // fall back to a case-insensitive string comparison
  if (version == null) {
    origVersions = origVersions.sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    )
    version = origVersions[origVersions.length - 1]
  }

  return version
}

/**
 * Slices the specified number of dotted parts from the given semver version.
 *
 * @param {string} v - The semver version to slice
 * @param {string} releaseType - The release type to slice up to. Can be one of "major", "minor", or "patch"
 * @returns {string|null} The sliced version as a string, or null if the version is not valid
 * @example
 * slice('2.4.7', 'minor') // returns '2.4' because it slices the version string up to the minor component.
 * slice('2.4.7-alpha', 'patch') // returns '2.4.7-alpha' because it slices the version string up to the patch component and preserves the prerelease component.
 * slice('2.4', 'patch') // returns null because the version string is not valid according to semver rules.
 */
function slice(v, releaseType) {
  if (!semver.valid(v, /* loose */ true)) {
    return null
  }

  const major = semver.major(v, /* loose */ true)
  const minor = semver.minor(v, /* loose */ true)
  const patch = semver.patch(v, /* loose */ true)
  const prerelease = semver.prerelease(v, /* loose */ true)

  const dottedParts = {
    major: [major],
    minor: [major, minor],
    patch: [major, minor, patch],
  }[releaseType]

  if (dottedParts === undefined) {
    throw Error(`Unknown releaseType: ${releaseType}`)
  }

  const dotted = dottedParts.join('.')
  if (prerelease) {
    return `${dotted}-${prerelease.join('.')}`
  } else {
    return dotted
  }
}

/**
 * Returns the start of the range that matches a given version string.
 *
 * @param {string} v - A version string that follows the Semantic Versioning specification. The function will accept and coerce invalid versions into valid ones.
 * @returns {string} The start of the range that matches the given version string, or null if no match is found.
 * @throws {TypeError} If v is an invalid semver range
 * @example
 * rangeStart('^1.2.3') // returns '1.2.3'
 * rangeStart('>=2.0.0') // returns '2.0.0'
 * rangeStart('1.x || >=2.5.0 || 5.0.0 - 7.2.3') // returns '1.0.0'
 * rangeStart('1.2.x') // returns '1.2.0'
 * rangeStart('1.2.*') // returns '1.2.0-0'
 * rangeStart(null) // throws TypeError: Invalid Version: null
 * rangeStart('') // throws TypeError: Invalid Version:
 */
function rangeStart(v) {
  const range = new semver.Range(v, /* loose */ true)
  return range.set[0][0].semver.version
}

/**
 * Creates a badge object that displays information about a version number. It should usually be used to output a version badge.
 *
 * @param {object} options - An object that contains the options for the badge
 * @param {string} options.version - The version number to display on the badge
 * @param {string} [options.tag] - The tag to display on the badge, such as "alpha" or "beta"
 * @param {string} [options.defaultLabel] - The default label to display on the badge, such as "npm" or "github"
 * @param {string} [options.prefix]  - The prefix to display on the message, such as ">=", "v", overrides the default behavior of using addv
 * @param {string} [options.suffix] - The suffix to display on the message, such as "tested"
 * @param {Function} [options.versionFormatter=versionColor] - The function to use to format the color of the badge based on the version number
 * @param {boolean} [options.isPrerelease] - Whether the version is explicitly marked as a prerelease by upstream API
 * @returns {object} A badge object that has three properties: label, message, and color
 * @example
 * renderVersionBadge({version: '1.2.3', tag: 'alpha', defaultLabel: 'npm'}) // returns {label: 'npm@alpha', message: 'v1.2.3', color: 'orange'} because
 * it uses the tag and the defaultLabel to create the label, the addv function to add a 'v' prefix to the version in message,
 * and the versionColor function to assign an orange color based on the version.
 */
function renderVersionBadge({
  version,
  tag,
  defaultLabel,
  prefix,
  suffix,
  versionFormatter = versionColor,
  isPrerelease,
}) {
  return {
    label: tag ? `${defaultLabel}@${tag}` : defaultLabel,
    message:
      (prefix ? `${prefix}${version}` : addv(version)) +
      (suffix ? ` ${suffix}` : ''),
    color: versionFormatter(isPrerelease ? 'pre' : version),
  }
}

export { latest, listCompare, slice, rangeStart, renderVersionBadge }
