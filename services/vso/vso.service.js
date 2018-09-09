'use strict'

const LegacyService = require('../legacy-service')
const { fetchFromSvg } = require('../../lib/svg-badge-parser')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

const fetchVstsBadge = (request, url, badgeData, sendBadge, format) => {
  fetchFromSvg(request, url, />([^<>]+)<\/text><\/g>/, (err, res) => {
    if (err != null) {
      badgeData.text[1] = 'inaccessible'
      sendBadge(format, badgeData)
      return
    }
    try {
      badgeData.text[1] = res.toLowerCase()
      if (res === 'succeeded') {
        badgeData.colorscheme = 'brightgreen'
        badgeData.text[1] = 'passing'
      } else if (res === 'partially succeeded') {
        badgeData.colorscheme = 'orange'
        badgeData.text[1] = 'passing'
      } else if (res === 'failed') {
        badgeData.colorscheme = 'red'
        badgeData.text[1] = 'failing'
      }
      sendBadge(format, badgeData)
    } catch (e) {
      badgeData.text[1] = 'invalid'
      sendBadge(format, badgeData)
    }
  })
}

module.exports = class Vso extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    // For Visual Studio Team Services builds.
    camp.route(
      /^\/vso\/build\/([^/]+)\/([^/]+)\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const name = match[1] // User name
        const project = match[2] // Project ID, e.g. 953a34b9-5966-4923-a48a-c41874cfb5f5
        const build = match[3] // Build definition ID, e.g. 1
        const branch = match[4]
        const format = match[5]
        let url = `https://${name}.visualstudio.com/_apis/public/build/definitions/${project}/${build}/badge`
        if (branch != null) {
          url += `?branchName=${branch}`
        }
        const badgeData = getBadgeData('build', data)
        fetchVstsBadge(request, url, badgeData, sendBadge, format)
      })
    )

    // For Visual Studio Team Services releases.
    camp.route(
      /^\/vso\/release\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const name = match[1] // User name
        const project = match[2] // Project ID, e.g. 953a34b9-5966-4923-a48a-c41874cfb5f5
        const release = match[3] // Release definition ID, e.g. 1
        const environment = match[4] // Environment ID, e.g. 1
        const format = match[5]
        const url = `https://${name}.vsrm.visualstudio.com/_apis/public/release/badge/${project}/${release}/${environment}`
        const badgeData = getBadgeData('deployment', data)
        fetchVstsBadge(request, url, badgeData, sendBadge, format)
      })
    )
  }
}
