'use strict'

const { satisfies } = require('@renovate/pep440')

// This list tracks "Active Python Releases" at
// https://www.python.org/downloads/ which means it needs to be manually updated
// every two years or so. It would be good to find a machine-readable version of
// this listing (like we do with PHP) so it does not need to be updated manually.
const ACTIVE_PYTHON_VERSIONS = ['2.7', '3.5', '3.6', '3.7', '3.8']

/*
  Django versions will be specified in the form major.minor
  trying to sort with `semver.compare` will throw e.g:
  TypeError: Invalid Version: 1.11
  because no patch release is specified, so we will define
  our own functions to parse and sort django versions
*/

function parseDjangoVersionString(str) {
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
function sortDjangoVersions(versions) {
  return versions.sort((a, b) => {
    if (
      parseDjangoVersionString(a).major === parseDjangoVersionString(b).major
    ) {
      return (
        parseDjangoVersionString(a).minor - parseDjangoVersionString(b).minor
      )
    } else {
      return (
        parseDjangoVersionString(a).major - parseDjangoVersionString(b).major
      )
    }
  })
}

// Extract classifiers from a pypi json response based on a regex.
function parseClassifiers(parsedData, pattern) {
  const results = []
  for (let i = 0; i < parsedData.info.classifiers.length; i++) {
    const matched = pattern.exec(parsedData.info.classifiers[i])
    if (matched && matched[1]) {
      results.push(matched[1].toLowerCase())
    }
  }
  return results
}

function getLicenses(packageData) {
  const {
    info: { license },
  } = packageData
  if (license) {
    return [license]
  } else {
    const parenthesizedAcronymRegex = /\(([^)]+)\)/
    const bareAcronymRegex = /^[a-z0-9]+$/
    let licenses = parseClassifiers(packageData, /^License :: (.+)$/)
      .map(classifier => classifier.split(' :: ').pop())
      .map(license => license.replace(' license', ''))
      .map(license => {
        const match = license.match(parenthesizedAcronymRegex)
        return match ? match[1].toUpperCase() : license
      })
      .map(license => {
        const match = license.match(bareAcronymRegex)
        return match ? license.toUpperCase() : license
      })
    if (licenses.length > 1) {
      licenses = licenses.filter(l => l !== 'dfsg approved')
    }
    return licenses
  }
}

function getPackageFormats(packageData) {
  const {
    info: { version },
    releases,
  } = packageData
  const releasesForVersion = releases[version]
  return {
    hasWheel: releasesForVersion.some(({ packagetype }) =>
      ['wheel', 'bdist_wheel'].includes(packagetype)
    ),
    hasEgg: releasesForVersion.some(({ packagetype }) =>
      ['egg', 'bdist_egg'].includes(packagetype)
    ),
  }
}

function getPythonVersionsFromClassifiers(packageData) {
  let versions = parseClassifiers(
    packageData,
    /^Programming Language :: Python :: ([\d.]+)$/
  )

  // If no versions are found yet, check "X :: Only" as a fallback.
  if (versions.length === 0) {
    versions.push(
      ...parseClassifiers(
        packageData,
        /^Programming Language :: Python :: (\d+) :: Only$/
      )
    )
  }

  // We only show v2 if eg. v2.4 does not appear.
  // See https://github.com/badges/shields/pull/489 for more.
  ;['2', '3'].forEach(majorVersion => {
    if (versions.some(v => v.startsWith(`${majorVersion}.`))) {
      versions = versions.filter(v => v !== majorVersion)
    }
  })

  return versions.sort()
}

function getPythonVersionsFromPythonRequires(packageData) {
  const {
    info: { requires_python: pythonRequires },
  } = packageData
  if (pythonRequires) {
    return ACTIVE_PYTHON_VERSIONS.filter(activeVersion =>
      satisfies(activeVersion, pythonRequires)
    )
  } else {
    return undefined
  }
}

module.exports = {
  parseClassifiers,
  parseDjangoVersionString,
  sortDjangoVersions,
  getLicenses,
  getPackageFormats,
  getPythonVersionsFromClassifiers,
  getPythonVersionsFromPythonRequires,
}
