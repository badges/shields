/**
 * Utilities relating to Lua 'rocks' version numbers. This compares version
 * numbers using the algorithm followed by luarocks command-line utility.
 *
 * Some specific things about LuaRocks package versioning:
 *
 * 1. A version string consists of two parts: the package version (version of
 *    the package _code_) and the revision of `rockspec` file
 *    https://github.com/luarocks/luarocks/wiki/Rockspec-format
 *        > **version** (string, mandatory field) - the version of the package,
 *          plus a suffix indicating the revision of the rockspec. Example:
 *          "2.0.1-1"
 * 2. The package version (the first part of the LuaRocks version, the part
 *    before dash) can be anything, SemVer is not mandatory and is not used
 *    very often. Non-digit versions are not rare: `scm`, `dev`, `alpha`,
 *    etc.
 * 3. `scm` (or `cvs`) is used to indicate dev version built from VCS (e.g.
 *    `"scm-1"`). `dev` version string is also used sometimes, and I don't
 *    know what the difference.
 * 4. LuaRocks API does not tell you which version is the “latest”, and the
 *    package maintainer cannot mark a specific version as the latest. You
 *    should figure out it yourself.
 *
 * https://github.com/luarocks/luarocks/blob/405ee29ba8444d97646f62e72effeaff2bfe3f79/src/luarocks/search.lua#L182
 * https://github.com/luarocks/luarocks/blob/405ee29ba8444d97646f62e72effeaff2bfe3f79/src/luarocks/core/vers.lua#L83
 */
import { omitv } from '../text-formatters.js'

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

export { parseVersion, compareVersionLists, latestVersion }
