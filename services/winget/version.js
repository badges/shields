/**
 * Comparing versions with winget's version comparator.
 *
 * See https://github.com/microsoft/winget-cli/blob/ae566c7bf21cfcc75be7ec30e4036a30eede8396/src/AppInstallerSharedLib/Versions.cpp for original implementation.
 *
 * @module
 */

/**
 * Compares two strings representing version numbers lexicographically and returns an integer value.
 *
 * @param {string} v1 - The first version to compare
 * @param {string} v2 - The second version to compare
 * @returns {number} -1 if v1 is smaller than v2, 1 if v1 is larger than v2, 0 if v1 and v2 are equal
 * @example
 * compareVersion('1.2.3', '1.2.4') // returns -1 because numeric part of first version is smaller than the numeric part of second version.
 */
function compareVersion(v1, v2) {
  // https://github.com/microsoft/winget-cli/blob/ae566c7bf21cfcc75be7ec30e4036a30eede8396/src/AppInstallerSharedLib/Versions.cpp#L109-L173
  // This implementation does not parse s_Approximate_Greater_Than
  // and s_Approximate_Less_Than since they won't appear in directory name (package version parsed by shields.io)
  const v1Trimmed = trimPrefix(v1)
  const v2Trimmed = trimPrefix(v2)

  const v1Latest = v1Trimmed.trim().toLowerCase() === 'latest'
  const v2Latest = v2Trimmed.trim().toLowerCase() === 'latest'

  if (v1Latest && v2Latest) {
    return 0
  } else if (v1Latest) {
    return 1
  } else if (v2Latest) {
    return -1
  }

  const v1Unknown = v1Trimmed.trim().toLowerCase() === 'unknown'
  const v2Unknown = v2Trimmed.trim().toLowerCase() === 'unknown'

  if (v1Unknown && v2Unknown) {
    return 0
  } else if (v1Unknown) {
    return -1
  } else if (v2Unknown) {
    return 1
  }

  const parts1 = v1Trimmed.split('.')
  const parts2 = v2Trimmed.split('.')

  trimLastZeros(parts1)
  trimLastZeros(parts2)

  for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
    const part1 = parts1[i]
    const part2 = parts2[i]

    const compare = compareVersionPart(part1, part2)
    if (compare !== 0) {
      return compare
    }
  }

  if (parts1.length === parts2.length) {
    return 0
  }

  if (parts1.length > parts2.length) {
    return 1
  } else if (parts1.length < parts2.length) {
    return -1
  }

  return 0
}

/**
 * Removes all leading non-digit characters from a version number string
 * if there is a digit before the split character, or no split characters exist.
 *
 * @param {string} version The version number string to trim
 * @returns {string} The version number string with all leading non-digit characters removed
 */
function trimPrefix(version) {
  // https://github.com/microsoft/winget-cli/blob/ae566c7bf21cfcc75be7ec30e4036a30eede8396/src/AppInstallerSharedLib/Versions.cpp#L66
  // If there is a digit before the split character, or no split characters exist, trim off all leading non-digit characters

  const digitPos = version.match(/(\d.*)/)
  const splitPos = version.match(/\./)
  if (digitPos && (splitPos == null || digitPos.index < splitPos.index)) {
    // there is digit before the split character so strip off all leading non-digit characters
    return version.slice(digitPos.index)
  }
  return version
}

/**
 * Removes all trailing zeros from a version number part array.
 *
 * @param {string[]} parts - parts
 */
function trimLastZeros(parts) {
  while (parts.length > 1 && parts[parts.length - 1].trim() === '0') {
    parts.pop()
  }
}

/**
 * Compares two strings representing version number parts lexicographically and returns an integer value.
 *
 * @param {string} part1 - The first version part to compare
 * @param {string} part2 - The second version part to compare
 * @returns {number} -1 if part1 is smaller than part2, 1 if part1 is larger than part2, 0 if part1 and part2 are equal
 * @example
 * compareVersionPart('3', '4') // returns -1 because numeric part of first part is smaller than the numeric part of second part.
 */
function compareVersionPart(part1, part2) {
  // https://github.com/microsoft/winget-cli/blob/ae566c7bf21cfcc75be7ec30e4036a30eede8396/src/AppInstallerSharedLib/Versions.cpp#L324-L352
  const [, numericString1, other1] = part1.trim().match(/^(\d*)(.*)$/)
  const [, numericString2, other2] = part2.trim().match(/^(\d*)(.*)$/)
  const numeric1 = parseInt(numericString1 || '0', 10)
  const numeric2 = parseInt(numericString2 || '0', 10)

  if (numeric1 < numeric2) {
    return -1
  } else if (numeric1 > numeric2) {
    return 1
  }
  // numeric1 === numeric2

  const otherFolded1 = (other1 ?? '').toLowerCase()
  const otherFolded2 = (other2 ?? '').toLowerCase()

  if (otherFolded1.length !== 0 && otherFolded2.length === 0) {
    return -1
  } else if (otherFolded1.length === 0 && otherFolded2.length !== 0) {
    return 1
  }

  if (otherFolded1 < otherFolded2) {
    return -1
  } else if (otherFolded1 > otherFolded2) {
    return 1
  }

  return 0
}

/**
 * Finds the largest version number lexicographically from an array of strings representing version numbers and returns it as a string.
 *
 * @param {string[]} versions - The array of version numbers to compare
 * @returns {string|undefined} The largest version number as a string, or undefined if the array is empty
 * @example
 * latest(['1.2.3', '1.2.4', '1.3', '2.0']) // returns '2.0' because it is the largest version number.
 * latest(['1.2.3', '1.2.4', '1.3-alpha', '2.0-beta']) // returns '2.0-beta'. there is no special handling for pre-release versions.
 */
function latest(versions) {
  const len = versions.length
  if (len === 0) {
    return
  }

  let version = versions[0]
  for (let i = 1; i < len; i++) {
    if (compareVersion(version, versions[i]) <= 0) {
      version = versions[i]
    }
  }
  return version
}

export { latest, compareVersion }
