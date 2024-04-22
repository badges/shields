/*
  Django versions will be specified in the form major.minor
  trying to sort with `semver.compare` will throw e.g:
  TypeError: Invalid Version: 1.11
  because no patch release is specified, so we will define
  our own functions to parse and sort django versions
*/

function parsePypiVersionString(str) {
  if (typeof str !== 'string') {
    return false
  }
  const x = str.split('.')
  const maj = parseInt(x[0]) || 0
  const min = parseInt(x[1]) || 0
  return {
    major: maj,
    minor: min,
  }
}

// Sort an array of django versions low to high.
function sortPypiVersions(versions) {
  return versions.sort((a, b) => {
    if (parsePypiVersionString(a).major === parsePypiVersionString(b).major) {
      return parsePypiVersionString(a).minor - parsePypiVersionString(b).minor
    } else {
      return parsePypiVersionString(a).major - parsePypiVersionString(b).major
    }
  })
}

// Extract classifiers from a pypi json response based on a regex.
function parseClassifiers(parsedData, pattern, preserveCase = false) {
  const results = []
  for (let i = 0; i < parsedData.info.classifiers.length; i++) {
    const matched = pattern.exec(parsedData.info.classifiers[i])
    if (matched && matched[1]) {
      if (preserveCase) {
        results.push(matched[1])
      } else {
        results.push(matched[1].toLowerCase())
      }
    }
  }
  return results
}

function getLicenses(packageData) {
  const {
    info: { license },
  } = packageData

  /*
  The .license field may either contain
  - a short license description (e.g: 'MIT' or 'GPL-3.0') or
  - the full text of a license
  but there is nothing in the response that tells us explicitly.
  We have to make an assumption based on the length.
  See https://github.com/badges/shields/issues/8689 and
  https://github.com/badges/shields/pull/8690 for more info.
  */
  if (license && license.length < 40) {
    return [license]
  } else {
    const parenthesizedAcronymRegex = /\(([^)]+)\)/
    const bareAcronymRegex = /^[a-z0-9]+$/
    const spdxAliases = {
      'OSI Approved :: Apache Software License': 'Apache-2.0',
      'CC0 1.0 Universal (CC0 1.0) Public Domain Dedication': 'CC0-1.0',
      'OSI Approved :: GNU Affero General Public License v3': 'AGPL-3.0',
      'OSI Approved :: Zero-Clause BSD (0BSD)': '0BSD',
    }
    let licenses = parseClassifiers(packageData, /^License :: (.+)$/, true)
      .map(classifier =>
        classifier in spdxAliases ? spdxAliases[classifier] : classifier,
      )
      .map(classifier => classifier.split(' :: ').pop())
      .map(license => license.replace(' License', ''))
      .map(license => {
        const match = license.match(parenthesizedAcronymRegex)
        return match ? match[1].toUpperCase() : license
      })
      .map(license => {
        const match = license.match(bareAcronymRegex)
        return match ? license.toUpperCase() : license
      })
    if (licenses.length > 1) {
      licenses = licenses.filter(l => l !== 'DFSG approved')
    }
    return licenses
  }
}

function getPackageFormats(packageData) {
  const { urls } = packageData
  return {
    hasWheel: urls.some(({ packagetype }) =>
      ['wheel', 'bdist_wheel'].includes(packagetype),
    ),
    hasEgg: urls.some(({ packagetype }) =>
      ['egg', 'bdist_egg'].includes(packagetype),
    ),
  }
}

export {
  parseClassifiers,
  parsePypiVersionString,
  sortPypiVersions,
  getLicenses,
  getPackageFormats,
}
