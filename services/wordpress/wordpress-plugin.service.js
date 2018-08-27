'use strict'

const semver = require('semver')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric, starRating } = require('../../lib/text-formatters')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

module.exports = class WordpressPlugin extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    // wordpress plugin version integration.
    // example: https://img.shields.io/wordpress/plugin/v/akismet.svg for https://wordpress.org/plugins/akismet
    camp.route(
      /^\/wordpress\/plugin\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const plugin = match[1] // eg, `akismet`.
        const format = match[2]
        const apiUrl =
          'http://api.wordpress.org/plugins/info/1.0/' + plugin + '.json'
        const badgeData = getBadgeData('plugin', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            const version = data.version
            badgeData.text[1] = versionText(version)
            badgeData.colorscheme = versionColor(version)
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )

    // wordpress plugin downloads integration.
    // example: https://img.shields.io/wordpress/plugin/dt/akismet.svg for https://wordpress.org/plugins/akismet
    camp.route(
      /^\/wordpress\/plugin\/dt\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const plugin = match[1] // eg, `akismet`.
        const format = match[2]
        const apiUrl =
          'http://api.wordpress.org/plugins/info/1.0/' + plugin + '.json'
        const badgeData = getBadgeData('downloads', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const total = JSON.parse(buffer).downloaded
            badgeData.text[1] = metric(total)
            if (total === 0) {
              badgeData.colorscheme = 'red'
            } else if (total < 100) {
              badgeData.colorscheme = 'yellow'
            } else if (total < 1000) {
              badgeData.colorscheme = 'yellowgreen'
            } else if (total < 10000) {
              badgeData.colorscheme = 'green'
            } else {
              badgeData.colorscheme = 'brightgreen'
            }
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )

    // wordpress plugin rating integration.
    // example: https://img.shields.io/wordpress/plugin/r/akismet.svg for https://wordpress.org/plugins/akismet
    camp.route(
      /^\/wordpress\/plugin\/r\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const plugin = match[1] // eg, `akismet`.
        const format = match[2]
        const apiUrl =
          'http://api.wordpress.org/plugins/info/1.0/' + plugin + '.json'
        const badgeData = getBadgeData('rating', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            let rating = parseInt(JSON.parse(buffer).rating)
            rating = (rating / 100) * 5
            badgeData.text[1] = starRating(rating)
            if (rating === 0) {
              badgeData.colorscheme = 'red'
            } else if (rating < 2) {
              badgeData.colorscheme = 'yellow'
            } else if (rating < 3) {
              badgeData.colorscheme = 'yellowgreen'
            } else if (rating < 4) {
              badgeData.colorscheme = 'green'
            } else {
              badgeData.colorscheme = 'brightgreen'
            }
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )

    // wordpress version support integration.
    // example: https://img.shields.io/wordpress/v/akismet.svg for https://wordpress.org/plugins/akismet
    camp.route(
      /^\/wordpress\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const plugin = match[1] // eg, `akismet`.
        const format = match[2]
        const apiUrl =
          'http://api.wordpress.org/plugins/info/1.0/' + plugin + '.json'
        const badgeData = getBadgeData('wordpress', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            if (data.tested) {
              let testedVersion = data.tested.replace(/[^0-9.]/g, '')
              badgeData.text[1] = testedVersion + ' tested'
              const coreUrl =
                'https://api.wordpress.org/core/version-check/1.7/'
              request(coreUrl, (err, res, response) => {
                try {
                  const versions = JSON.parse(response).offers.map(
                    v => v.version
                  )
                  if (err !== null) {
                    sendBadge(format, badgeData)
                    return
                  }
                  const svTestedVersion =
                    testedVersion.split('.').length === 2
                      ? (testedVersion += '.0')
                      : testedVersion
                  const svVersion =
                    versions[0].split('.').length === 2
                      ? (versions[0] += '.0')
                      : versions[0]
                  if (
                    testedVersion === versions[0] ||
                    semver.gtr(svTestedVersion, svVersion)
                  ) {
                    badgeData.colorscheme = 'brightgreen'
                  } else if (versions.indexOf(testedVersion) !== -1) {
                    badgeData.colorscheme = 'orange'
                  } else {
                    badgeData.colorscheme = 'yellow'
                  }
                  sendBadge(format, badgeData)
                } catch (e) {
                  badgeData.text[1] = 'invalid'
                  sendBadge(format, badgeData)
                }
              })
            } else {
              sendBadge(format, badgeData)
            }
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
