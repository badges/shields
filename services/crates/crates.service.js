'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const {
  downloadCount: downloadCountColor,
  version: versionColor,
} = require('../../lib/color-formatters')
const { metric, addv: versionText } = require('../../lib/text-formatters')

module.exports = class Crates extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/crates\/(d|v|dv|l)\/([A-Za-z0-9_-]+)(?:\/([0-9.]+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const mode = match[1] // d - downloads (total or for version), v - (latest) version, dv - downloads (for latest version)
        const crate = match[2] // crate name, e.g. rustc-serialize
        let version = match[3] // crate version in semver format, optional, e.g. 0.1.2
        const format = match[4]
        const modes = {
          d: {
            name: 'downloads',
            version: true,
            process: function(data, badgeData) {
              const downloads = data.crate
                ? data.crate.downloads
                : data.version.downloads
              version = data.version && data.version.num
              badgeData.text[1] =
                metric(downloads) + (version ? ` version ${version}` : '')
              badgeData.colorscheme = downloadCountColor(downloads)
            },
          },
          dv: {
            name: 'downloads',
            version: true,
            process: function(data, badgeData) {
              const downloads = data.version
                ? data.version.downloads
                : data.versions[0].downloads
              version = data.version && data.version.num
              badgeData.text[1] =
                metric(downloads) +
                (version ? ` version ${version}` : ' latest version')
              badgeData.colorscheme = downloadCountColor(downloads)
            },
          },
          v: {
            name: 'crates.io',
            version: true,
            process: function(data, badgeData) {
              version = data.version ? data.version.num : data.crate.max_version
              badgeData.text[1] = versionText(version)
              badgeData.colorscheme = versionColor(version)
            },
          },
          l: {
            name: 'license',
            version: false,
            process: function(data, badgeData) {
              badgeData.text[1] = data.versions[0].license
              badgeData.colorscheme = 'blue'
            },
          },
        }
        const behavior = modes[mode]
        let apiUrl = `https://crates.io/api/v1/crates/${crate}`
        if (version != null && behavior.version) {
          apiUrl += `/${version}`
        }

        const badgeData = getBadgeData(behavior.name, data)
        request(
          apiUrl,
          { headers: { Accept: 'application/json' } },
          (err, res, buffer) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }
            try {
              const data = JSON.parse(buffer)
              behavior.process(data, badgeData)
              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          }
        )
      })
    )
  }
}
