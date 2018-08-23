'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const {
  compare: phpVersionCompare,
  latest: phpLatestVersion,
  isStable: phpStableVersion,
} = require('../../lib/php-version')

module.exports = class PackagistVersion extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/packagist\/(v|vpre)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache(function(data, match, sendBadge, request) {
        var info = match[1] // either `v` or `vpre`.
        var userRepo = match[2] // eg, `doctrine/orm`.
        var format = match[3]
        var apiUrl = 'https://packagist.org/packages/' + userRepo + '.json'
        var badgeData = getBadgeData('packagist', data)
        if (userRepo.substr(-14) === '/:package_name') {
          badgeData.text[1] = 'invalid'
          return sendBadge(format, badgeData)
        }
        request(apiUrl, function(err, res, buffer) {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            var data = JSON.parse(buffer)

            var versionsData = data.package.versions
            var versions = Object.keys(versionsData)

            // Map aliases (eg, dev-master).
            var aliasesMap = {}
            versions.forEach(function(version) {
              var versionData = versionsData[version]
              if (
                versionData.extra &&
                versionData.extra['branch-alias'] &&
                versionData.extra['branch-alias'][version]
              ) {
                // eg, version is 'dev-master', mapped to '2.0.x-dev'.
                var validVersion = versionData.extra['branch-alias'][version]
                if (
                  aliasesMap[validVersion] === undefined ||
                  phpVersionCompare(aliasesMap[validVersion], validVersion) < 0
                ) {
                  versions.push(validVersion)
                  aliasesMap[validVersion] = version
                }
              }
            })
            versions = versions.filter(function(version) {
              return !/^dev-/.test(version)
            })

            var badgeText = null
            var badgeColor = null

            switch (info) {
              case 'v':
                var stableVersions = versions.filter(phpStableVersion)
                var stableVersion = phpLatestVersion(stableVersions)
                if (!stableVersion) {
                  stableVersion = phpLatestVersion(versions)
                }
                //if (!!aliasesMap[stableVersion]) {
                //  stableVersion = aliasesMap[stableVersion];
                //}
                badgeText = versionText(stableVersion)
                badgeColor = versionColor(stableVersion)
                break
              case 'vpre':
                var unstableVersion = phpLatestVersion(versions)
                //if (!!aliasesMap[unstableVersion]) {
                //  unstableVersion = aliasesMap[unstableVersion];
                //}
                badgeText = versionText(unstableVersion)
                badgeColor = 'orange'
                break
            }

            if (badgeText !== null) {
              badgeData.text[1] = badgeText
              badgeData.colorscheme = badgeColor
            }

            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
