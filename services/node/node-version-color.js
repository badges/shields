'use strict'

const { promisify } = require('util')
const moment = require('moment')
const semver = require('semver')
const { regularUpdate } = require('../../core/legacy/regular-update')

const dateFormat = 'YYYY-MM-DD'

function getVersion(version) {
  let semver = ``
  if (version) {
    semver = `-${version}.x`
  }
  return promisify(regularUpdate)({
    url: `https://nodejs.org/dist/latest${semver}/SHASUMS256.txt`,
    intervalMillis: 24 * 3600 * 1000,
    json: false,
    scraper: shasums => {
      // tarball index start, tarball index end
      const taris = shasums.indexOf('node-v')
      const tarie = shasums.indexOf('\n', taris)
      const tarball = shasums.slice(taris, tarie)
      return tarball.split('-')[1]
    },
  })
}

function ltsVersionsScraper(versions) {
  const currentDate = moment().format(dateFormat)
  return Object.keys(versions).filter(function (version) {
    const data = versions[version]
    return data.lts && data.lts < currentDate && data.end > currentDate
  })
}

async function getCurrentVersion() {
  return getVersion()
}

async function getLtsVersions() {
  const versions = await promisify(regularUpdate)({
    url:
      'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json',
    intervalMillis: 24 * 3600 * 1000,
    json: true,
    scraper: ltsVersionsScraper,
  })
  return Promise.all(versions.map(getVersion))
}

async function versionColorForRangeLts(range) {
  const ltsVersions = await getLtsVersions()
  try {
    const matchesAll = ltsVersions.reduce(function (satisfies, version) {
      return satisfies && semver.satisfies(version, range)
    }, true)
    const matchesSome = ltsVersions.reduce(function (satisfies, version) {
      return satisfies || semver.satisfies(version, range)
    }, false)
    if (matchesAll) {
      return 'brightgreen'
    } else if (matchesSome) {
      return 'yellow'
    } else {
      return 'orange'
    }
  } catch (e) {
    return 'lightgray'
  }
}

async function versionColorForRangeCurrent(range) {
  const latestVersion = await getCurrentVersion()
  try {
    if (semver.satisfies(latestVersion, range)) {
      return 'brightgreen'
    } else if (semver.gtr(latestVersion, range)) {
      return 'yellow'
    } else {
      return 'orange'
    }
  } catch (e) {
    return 'lightgray'
  }
}

module.exports = {
  versionColorForRangeCurrent,
  versionColorForRangeLts,
}
