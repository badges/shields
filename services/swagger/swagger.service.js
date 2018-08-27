'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

// For a Swagger Validator.
module.exports = class Swagger extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/swagger\/(valid)\/(2\.0)\/(https?)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        // match[1] is not used                 // e.g. `valid` for validate
        // match[2] is reserved for future use  // e.g. `2.0` for OpenAPI 2.0
        const scheme = match[3] // e.g. `https`
        const swaggerUrl = match[4] // e.g. `api.example.com/swagger.yaml`
        const format = match[5]

        const badgeData = getBadgeData('swagger', data)

        const urlParam = encodeURIComponent(scheme + '://' + swaggerUrl)
        const url = 'http://online.swagger.io/validator/debug?url=' + urlParam
        const options = {
          method: 'GET',
          url: url,
          gzip: true,
          json: true,
        }
        request(options, (err, res, json) => {
          try {
            if (
              err != null ||
              res.statusCode >= 500 ||
              typeof json !== 'object'
            ) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }

            const messages = json.schemaValidationMessages
            if (messages == null || messages.length === 0) {
              badgeData.colorscheme = 'brightgreen'
              badgeData.text[1] = 'valid'
            } else {
              badgeData.colorscheme = 'red'

              const firstMessage = messages[0]
              if (
                messages.length === 1 &&
                firstMessage.level === 'error' &&
                /^Can't read from/.test(firstMessage.message)
              ) {
                badgeData.text[1] = 'not found'
              } else {
                badgeData.text[1] = 'invalid'
              }
            }
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
