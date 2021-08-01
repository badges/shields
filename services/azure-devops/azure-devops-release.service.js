import { renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService } from '../index.js'
import { keywords, fetch } from './azure-devops-helpers.js'

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
  <code>https://img.shields.io/vso/release/ORGANIZATION/PROJECT_ID/DEFINITION_ID/ENVIRONMENT_ID.svg</code>.
</p>
`

export default class AzureDevOpsRelease extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'azure-devops/release',
    pattern: ':organization/:projectId/:definitionId/:environmentId',
  }

  static examples = [
    {
      title: 'Azure DevOps releases',
      namedParams: {
        organization: 'totodem',
        projectId: '8cf3ec0e-d0c2-4fcd-8206-ad204f254a96',
        definitionId: '1',
        environmentId: '1',
      },
      staticPreview: renderBuildStatusBadge({ status: 'succeeded' }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'deployment' }

  async handle({ organization, projectId, definitionId, environmentId }) {
    // Microsoft documentation: ?
    const props = await fetch(this, {
      url: `https://vsrm.dev.azure.com/${organization}/_apis/public/Release/badge/${projectId}/${definitionId}/${environmentId}`,
      errorMessages: {
        400: 'project not found',
        404: 'user or environment not found',
        500: 'inaccessible or definition not found',
      },
    })
    return renderBuildStatusBadge(props)
  }
}
