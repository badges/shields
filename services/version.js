/**
 * Utilities relating to generating badges relating to version numbers. Includes
 * comparing versions to determine the latest, and determining the color to use
 * for the badge based on whether the version is a stable release.
 *
 * For utilities specific to PHP version ranges, see php-version.js.
 */
'use strict'

const semver = require('semver')
const { addv } = require('./text-formatters')
const { version: versionColor } = require('./color-formatters')

function listCompare(a, b) {
  const alen = a.length,
    blen = b.length
  for (let i = 0; i < alen; i++) {
    if (a[i] < b[i]) {
      return -1
    } else if (a[i] > b[i]) {
      return 1
    }
  }
  return alen - blen
}

// Take string versions.
// -1 if v1 < v2, 1 if v1 > v2, 0 otherwise.
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

// Take a list of string versions.
// Return the latest, or undefined, if there are none.
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

// Given a list of versions (as strings), return the latest version.
// Return undefined if no version could be found.
function latest(versions, { pre = false } = {}) {
  let version = ''
  let origVersions = versions
  // return all results that are likely semver compatible versions
  versions = origVersions.filter(version => /\d+\.\d+/.test(version))
  // If no semver versions then look for single numbered versions
  if (!versions.length) {
    versions = origVersions.filter(version => /\d+/.test(version))
  }
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
        /* loose */ true
      )
    )[versions.length - 1]
  } catch (e) {
    version = latestDottedVersion(versions)
  }
  if (version === undefined || version === null) {
    origVersions = origVersions.sort()
    version = origVersions[origVersions.length - 1]
  }
  return version
}

// Slice the specified number of dotted parts from the given semver version.
// e.g. slice('2.4.7', 'minor') -> '2.4'
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

function rangeStart(v) {
  const range = new semver.Range(v, /* loose */ true)
  return range.set[0][0].semver.version
}

function renderVersionBadge({ version, tag, defaultLabel }) {
  return {
    label: tag ? `${defaultLabel}@${tag}` : undefined,
    message: addv(version),
    color: versionColor(version),
  }
}

module.exports = {
  latest,
  listCompare,
  slice,
  rangeStart,
  renderVersionBadge,
}
