'use strict'

const { addv } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const AzureDevOpsBase = require('./azure-devops-base')
const { keywords, getHeaders } = require('./azure-devops-helpers')

const documentation = `
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
  <code>https://img.shields.io/vso/version/release/ORGANIZATION/PROJECT_ID/DEFINITION_ID/ENVIRONMENT_ID.svg</code>.
</p>
`

module.exports = class AzureDevOpsVersion extends AzureDevOpsBase {
  static renderVersionBadge({ version, label }) {
    return {
      label,
      message: addv(version),
      color: versionColor(version),
    }
  }

  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: '',
      format:
        '(?:azure-devops|vso)/version/release/([^/]+)/([^/]+)/([^/]+)/([^/]+)',
      capture: ['organization', 'projectId', 'definitionId', 'environmentId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Azure DevOps releases version',
        pattern:
          'azure-devops/version/release/:organization/:projectId/:definitionId/:environmentId',
        namedParams: {
          organization: 'totodem',
          projectId: '8cf3ec0e-d0c2-4fcd-8206-ad204f254a96',
          definitionId: '1',
          environmentId: '1',
        },
        staticPreview: this.renderVersionBadge({
          version: '6.3.0',
          label: 'production',
        }),
        keywords,
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'version',
    }
  }

  async handle({ organization, projectId, definitionId, environmentId }) {
    const headers = getHeaders()
    const errorMessages = {
      404: 'release pipeline not found',
    }

    const releaseInfo = await this.getLatestCompletedReleaseInfo(
      organization,
      projectId,
      definitionId,
      environmentId,
      headers,
      errorMessages
    )

    // Use the first artifact in the release pipeline
    const version =
      releaseInfo.release.artifacts[0].definitionReference.version.name
    const envName = releaseInfo.releaseEnvironment.name

    return this.constructor.renderVersionBadge({ version, label: envName })
  }
}
