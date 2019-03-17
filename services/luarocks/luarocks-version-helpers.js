/**
 * Utilities relating to Lua 'rocks' version numbers.
 * This compares version numbers using the algorithm
 * followed by luarocks command-line utility
 */
'use strict'

const { omitv } = require('../text-formatters')

// Compare two arrays containing split and transformed to
// positive/negative numbers parts of version strings,
// respecting negative/missing values:
// [1, 2, 1] > [1, 2], but [1, 2, -1] < [1, 2] ([1, 2] is aligned to [1, 2, 0])
// Return a negative value if v1 < v2,
// zero if v1 = v2,
// a positive value otherwise.
function compareVersionLists(v1, v2) {
  const maxLength = Math.max(v1.length, v2.length)
  let p1, p2
  for (let i = 0; i < maxLength; i++) {
    p1 = v1[i] || 0
    p2 = v2[i] || 0
    if (p1 > p2) return 1
    if (p1 < p2) return -1
  }
  return 0
}

// Parse a dotted version string to an array of numbers
// 'rc', 'pre', 'beta', 'alpha' are converted to negative numbers
function parseVersion(versionString) {
  versionString = versionString.toLowerCase().replace('-', '.')
  const versionList = []
  versionString.split('.').forEach(versionPart => {
    const parsedPart = /(\d*)([a-z]*)(\d*)/.exec(versionPart)
    if (parsedPart[1]) {
      versionList.push(parseInt(parsedPart[1]))
    }
    if (parsedPart[2]) {
      let weight
      // calculate weight as a negative number
      // 'rc' > 'pre' > 'beta' > 'alpha' > any other value
      switch (parsedPart[2]) {
        case 'alpha':
        case 'beta':
        case 'pre':
        case 'rc':
          weight = (parsedPart[2].charCodeAt(0) - 128) * 100
          break
        default:
          weight = -10000
      }
      // add positive number, i.e. 'beta5' > 'beta2'
      weight += parseInt(parsedPart[3]) || 0
      versionList.push(weight)
    }
  })
  return versionList
}

function latestVersion(versions) {
  return versions
    .map(omitv)
    .sort((a, b) => compareVersionLists(parseVersion(a), parseVersion(b)))
    .pop()
}

module.exports = {
  parseVersion,
  compareVersionLists,
  latestVersion,
}
