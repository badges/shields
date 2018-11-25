'use strict'

const {
  compare: phpVersionCompare,
  latest: phpLatestVersion,
  isStable: phpStableVersion,
} = require('../../lib/php-version')

const getLatestVersion = function(versionsData, stable = true) {
  let versions = Object.keys(versionsData)

  // Map aliases (eg, dev-master).
  const aliasesMap = {}
  versions.forEach(version => {
    const versionData = versionsData[version]
    if (
      versionData.extra &&
      versionData.extra['branch-alias'] &&
      versionData.extra['branch-alias'][version]
    ) {
      // eg, version is 'dev-master', mapped to '2.0.x-dev'.
      const validVersion = versionData.extra['branch-alias'][version]
      if (
        aliasesMap[validVersion] === undefined ||
        phpVersionCompare(aliasesMap[validVersion], validVersion) < 0
      ) {
        versions.push(validVersion)
        aliasesMap[validVersion] = version
      }
    }
  })
  versions = versions.filter(version => !/^dev-/.test(version))

  if (stable) {
    const stableVersions = versions.filter(phpStableVersion)
    let stableVersion = phpLatestVersion(stableVersions)
    if (!stableVersion) {
      stableVersion = phpLatestVersion(versions)
    }
    return stableVersion
  } else {
    return phpLatestVersion(versions)
  }
}

module.exports = {
  getLatestVersion,
}
