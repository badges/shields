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
    // For Azure DevOps builds.
    camp.route(
      /^\/vso\/build\/([^/]+)\/([^/]+)\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        // Microsoft documentation: https://docs.microsoft.com/en-us/rest/api/vsts/build/status/get
        const organization = match[1] // The name (string) of the Azure DevOps organization.
        const projectId = match[2] // The ID (uuid) of the project.
        const definitionId = match[3] // The ID (int) of the definition.
        const branchName = match[4] // The name (string) of the branch.
        const format = match[5]
        let url = `https://dev.azure.com/${organization}/${projectId}/_apis/build/status/${definitionId}`
        if (branchName != null) {
          url += `?branchName=${branchName}`
        }
        const badgeData = getBadgeData('build', data)
        fetchVstsBadge(request, url, badgeData, sendBadge, format)
      })
    )

    // For Azure DevOps releases.
    camp.route(
      /^\/vso\/release\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        // Microsoft documentation: ?
        const organization = match[1] // The name (string) of the Azure DevOps organization.
        const projectId = match[2] // The ID (uuid) of the project.
        const definitionId = match[3] // The ID (int) of the definition.
        const environmentId = match[4] // The ID (int) of the release environment.
        const format = match[5]
        const url = `https://vsrm.dev.azure.com/${organization}/_apis/public/Release/badge/${projectId}/${definitionId}/${environmentId}`
        const badgeData = getBadgeData('deployment', data)
        fetchVstsBadge(request, url, badgeData, sendBadge, format)
      })
    )
  }
}
