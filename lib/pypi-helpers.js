'use strict'

/*
  Django versions will be specified in the form major.minor
  trying to sort with `semver.compare` will throw e.g:
  TypeError: Invalid Version: 1.11
  because no patch release is specified, so we will define
  our own functions to parse and sort django versions
*/

const parseDjangoVersionString = function(str) {
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

// sort an array of django versions low to high
const sortDjangoVersions = function(versions) {
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

// extract classifiers from a pypi json response based on a regex
const parseClassifiers = function(parsedData, pattern) {
  const results = []
  for (let i = 0; i < parsedData.info.classifiers.length; i++) {
    const matched = pattern.exec(parsedData.info.classifiers[i])
    if (matched && matched[1]) {
      results.push(matched[1].toLowerCase())
    }
  }
  return results
}

module.exports = {
  parseClassifiers,
  parseDjangoVersionString,
  sortDjangoVersions,
}
