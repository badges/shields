/**
 * Utilities relating to generating badges relating to version numbers. Includes
 * comparing versions to determine the latest, and determining the color to use
 * for the badge based on whether the version is a stable release.
 *
 * For utilities specific to PHP version ranges, see php-version.js.
 */
'use strict';

const semver = require('semver');

// Given a list of versions (as strings), return the latest version.
// Return undefined if no version could be found.
function latest(versions) {
  let version = '';
  let origVersions = versions;
  versions = versions.filter(function(version) {
    return (/[0-9]/).test(version);
  });
  try {
    version = semver.maxSatisfying(versions, '');
  } catch(e) {
    version = latestDottedVersion(versions);
  }
  if (version === undefined) {
    origVersions = origVersions.sort();
    version = origVersions[origVersions.length - 1];
  }
  return version;
}
exports.latest = latest;

function listCompare(a, b) {
  const alen = a.length, blen = b.length;
  for (let i = 0; i < alen; i++) {
    if (a[i] < b[i]) {
      return -1;
    } else if (a[i] > b[i]) {
      return 1;
    }
  }
  return alen - blen;
}
exports.listCompare = listCompare;

// === Private helper functions ===

// Take a list of string versions.
// Return the latest, or undefined, if there are none.
function latestDottedVersion(versions) {
  const len = versions.length;
  if (len === 0) { return; }
  let version = versions[0];
  for (let i = 1; i < len; i++) {
    if (compareDottedVersion(version, versions[i]) < 0) {
      version = versions[i];
    }
  }
  return version;
}

// Take string versions.
// -1 if v1 < v2, 1 if v1 > v2, 0 otherwise.
function compareDottedVersion(v1, v2) {
  const parts1 = /([0-9.]+)(.*)$/.exec(v1);
  const parts2 = /([0-9.]+)(.*)$/.exec(v2);
  if (parts1 != null && parts2 != null) {
    const numbers1 = parts1[1];
    const numbers2 = parts2[1];
    const distinguisher1 = parts1[2];
    const distinguisher2 = parts2[2];
    const numlist1 = numbers1.split('.').map(function(e) { return +e; });
    const numlist2 = numbers2.split('.').map(function(e) { return +e; });
    const cmp = listCompare(numlist1, numlist2);
    if (cmp !== 0) {
      return cmp;
    } else {
      return distinguisher1 < distinguisher2? -1:
        distinguisher1 > distinguisher2? 1: 0;
    }
  }
  return v1 < v2? -1: v1 > v2? 1: 0;
}
