'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')

module.exports = class Ansible extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/ansible\/role\/(?:(d)\/)?(\d+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1] // eg d or nothing
        const roleId = match[2] // eg 3078
        const format = match[3]
        const options = {
          json: true,
          uri: 'https://galaxy.ansible.com/api/v1/roles/' + roleId + '/',
        }
        const badgeData = getBadgeData('role', data)
        // eslint-disable-next-line handle-callback-err
        request(options, (err, res, json) => {
          if (
            res &&
            (res.statusCode === 404 ||
              json === undefined ||
              json.state === null)
          ) {
            badgeData.text[1] = 'not found'
            sendBadge(format, badgeData)
            return
          }
          try {
            if (type === 'd') {
              badgeData.text[0] = getLabel('role downloads', data)
              badgeData.text[1] = metric(json.download_count)
              badgeData.colorscheme = 'blue'
            } else {
              badgeData.text[1] =
                json.summary_fields.namespace.name + '.' + json.name
              badgeData.colorscheme = 'blue'
            }
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'errored'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
