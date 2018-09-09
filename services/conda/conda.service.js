'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { metric, addv: versionText } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
  version: versionColor,
} = require('../../lib/color-formatters')

// For Anaconda Cloud / conda package manager.
module.exports = class Conda extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/conda\/([dvp]n?)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((queryData, match, sendBadge, request) => {
        const mode = match[1]
        const channel = match[2]
        const pkgname = match[3]
        const format = match[4]
        const url =
          'https://api.anaconda.org/package/' + channel + '/' + pkgname
        const labels = {
          d: 'downloads',
          p: 'platform',
          v: channel,
        }
        const modes = {
          // downloads - 'd'
          d: function(data, badgeData) {
            const downloads = data.files.reduce(
              (total, file) => total + file.ndownloads,
              0
            )
            badgeData.text[1] = metric(downloads)
            badgeData.colorscheme = downloadCountColor(downloads)
          },
          // latest version 'v'
          v: function(data, badgeData) {
            const version = data.latest_version
            badgeData.text[1] = versionText(version)
            badgeData.colorscheme = versionColor(version)
          },
          // platform 'p'
          p: function(data, badgeData) {
            const platforms = data.conda_platforms.join(' | ')
            badgeData.text[1] = platforms
          },
        }
        const variants = {
          // default use `conda|{channelname}` as label
          '': function(queryData, badgeData) {
            badgeData.text[0] = getLabel(
              `conda|${badgeData.text[0]}`,
              queryData
            )
          },
          // skip `conda|` prefix
          n: function(queryData, badgeData) {},
        }

        const update = modes[mode.charAt(0)]
        const variant = variants[mode.charAt(1)]

        const badgeData = getBadgeData(labels[mode.charAt(0)], queryData)
        request(url, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            variant(queryData, badgeData)
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            update(data, badgeData)
            variant(queryData, badgeData)
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            variant(queryData, badgeData)
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
