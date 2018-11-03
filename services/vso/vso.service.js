'use strict'

const LegacyService = require('../legacy-service')
const { fetchFromSvg } = require('../../lib/svg-badge-parser')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

const devOpsBuildDoc = `
<p>
  To obtain your own badge, you need to get 3 pieces of information:
  <code>ORGANIZATION</code>, <code>PROJECT_ID</code> and <code>DEFINITION_ID</code>.
</p>
<p>
  First, you need to edit your build definition and look at the url:
</p>
<img
  src="https://user-images.githubusercontent.com/3749820/47259976-e2d9ec80-d4b2-11e8-92cc-7c81089a7a2c.png"
  alt="ORGANIZATION is after the dev.azure.com part, PROJECT_NAME is right after that, DEFINITION_ID is at the end after the id= part." />
<p>
  Then, you can get the <code>PROJECT_ID</code> from the <code>PROJECT_NAME</code> using Azure DevOps REST API.
  Just access to: <code>https://dev.azure.com/ORGANIZATION/_apis/projects/PROJECT_NAME</code>.
</p>
<img
  src="https://user-images.githubusercontent.com/3749820/47266325-1d846900-d535-11e8-9211-2ee72fb91877.png"
  alt="PROJECT_ID is in the id property of the API response." />
<p>
  Your badge will then have the form:
  <code>https://img.shields.io/vso/build/ORGANIZATION/PROJECT_ID/DEFINITION_ID.svg</code>.
</p>
<p>
  Optionally, you can specify a named branch:
  <code>https://img.shields.io/vso/build/ORGANIZATION/PROJECT_ID/DEFINITION_ID/NAMED_BRANCH.svg</code>.
</p>
`

const devOpsReleaseDoc = `
<p>
  To obtain your own badge, you need to get 4 pieces of information:
  <code>ORGANIZATION</code>, <code>PROJECT_ID</code>, <code>DEFINITION_ID</code> and <code>ENVIRONMENT_ID</code>.
</p>
<p>
  First, you need to enable badges for each required environments in the options of your release definition.
  Once you have save the change, look at badge url:
</p>
<img
  src="https://user-images.githubusercontent.com/3749820/47266694-7f939d00-d53a-11e8-9224-c2371dd2d0c9.png"
  alt="ORGANIZATION is after the dev.azure.com part, PROJECT_ID is after the badge part, DEFINITION_ID and ENVIRONMENT_ID are right after that." />
<p>
  Your badge will then have the form:
  <code>https://img.shields.io/vso/release/ORGANIZATION/PROJECT_ID/DEFINITION_ID/ENVIRONMENT_ID.svg</code>.
</p>
`

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
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'vso',
    }
  }

  static get examples() {
    return [
      {
        title: 'Azure DevOps builds',
        previewUrl: 'build/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/2',
        documentation: devOpsBuildDoc,
      },
      {
        title: 'Azure DevOps releases',
        previewUrl: 'release/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/1/1',
        documentation: devOpsReleaseDoc,
      },
    ]
  }

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
