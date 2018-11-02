'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const serverSecrets = require('../../lib/server-secrets')

module.exports = class Bintray extends LegacyService {
  static get category() {
    return 'version'
  }

  static get url() {
    return { base: 'bintray/v' }
  }

  static get examples() {
    return [
      {
        title: 'Bintray',
        previewUrl: 'asciidoctor/maven/asciidoctorj',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/bintray\/v\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const path = match[1] // :subject/:repo/:package (e.g. asciidoctor/maven/asciidoctorj)
        const format = match[2]

        const options = {
          method: 'GET',
          uri: `https://bintray.com/api/v1/packages/${path}/versions/_latest`,
          headers: {
            Accept: 'application/json',
          },
        }

        if (serverSecrets && serverSecrets.bintray_user) {
          options.auth = {
            user: serverSecrets.bintray_user,
            pass: serverSecrets.bintray_apikey,
          }
        }

        const badgeData = getBadgeData('bintray', data)
        request(options, (err, res, buffer) => {
          if (err !== null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            badgeData.text[1] = versionText(data.name)
            badgeData.colorscheme = versionColor(data.name)
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
