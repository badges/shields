import moment from 'moment'
import semver from 'semver'
import { getCachedResource } from '../../core/base-service/resource-cache.js'

const dateFormat = 'YYYY-MM-DD'

async function getVersion(version) {
  let semver = ``
  if (version) {
    semver = `-${version}.x`
  }
  return getCachedResource({
    url: `https://nodejs.org/dist/latest${semver}/SHASUMS256.txt`,
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
  const versions = await getCachedResource({
    url: 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json',
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

export { versionColorForRangeCurrent, versionColorForRangeLts }
