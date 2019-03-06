'use strict'

const { promisify } = require('util')
const semver = require('semver')
const { regularUpdate } = require('../../core/legacy/regular-update')

function getLatestVersion() {
  return promisify(regularUpdate)({
    url: 'https://nodejs.org/dist/latest/SHASUMS256.txt',
    intervalMillis: 24 * 3600 * 1000,
    json: false,
    scraper: shasums => {
      // tarball index start, tarball index end
      const taris = shasums.indexOf('node-v')
      const tarie = shasums.indexOf('\n', taris)
      const tarball = shasums.slice(taris, tarie)
      const version = tarball.split('-')[1]
      return version
    },
  })
}

async function versionColorForRange(range) {
  const latestVersion = await getLatestVersion()
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
  getLatestVersion,
  versionColorForRange,
}
