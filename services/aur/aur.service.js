'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')
const { addv: versionText } = require('../../lib/text-formatters')

// For the Arch user repository (AUR).
module.exports = class Aur extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/aur\/(version|votes|license)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1]
        const pkg = match[2]
        const format = match[3]
        const apiUrl = 'https://aur.archlinux.org/rpc.php?type=info&arg=' + pkg
        const badgeData = getBadgeData('aur', data)
        request(apiUrl, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedBuffer = JSON.parse(buffer)
            const parsedData = parsedBuffer.results
            if (parsedBuffer.resultcount === 0) {
              // Note the 'not found' response from Arch Linux is:
              // status code = 200,
              // body = {"version":1,"type":"info","resultcount":0,"results":[]}
              badgeData.text[1] = 'not found'
              sendBadge(format, badgeData)
              return
            }

            if (info === 'version') {
              badgeData.text[1] = versionText(parsedData.Version)
              if (parsedData.OutOfDate === null) {
                badgeData.colorscheme = 'blue'
              } else {
                badgeData.colorscheme = 'orange'
              }
            } else if (info === 'votes') {
              const votes = parsedData.NumVotes
              badgeData.text[0] = getLabel('votes', data)
              badgeData.text[1] = votes
              badgeData.colorscheme = floorCountColor(votes, 2, 20, 60)
            } else if (info === 'license') {
              const license = parsedData.License
              badgeData.text[0] = getLabel('license', data)
              badgeData.text[1] = license
              badgeData.colorscheme = 'blue'
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
