import { renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService, pathParams } from '../index.js'
import { fetch } from './azure-devops-helpers.js'

const description = `
To obtain your own badge, you need to get 4 pieces of information:
\`ORGANIZATION\`, \`PROJECT_ID\`, \`DEFINITION_ID\` and \`ENVIRONMENT_ID\`.

First, you need to enable badges for each required environments in the options of your release definition.
Once you have save the change, look at badge url:

<img
  src="https://user-images.githubusercontent.com/3749820/47266694-7f939d00-d53a-11e8-9224-c2371dd2d0c9.png"
  alt="ORGANIZATION is after the dev.azure.com part, PROJECT_ID is after the badge part, DEFINITION_ID and ENVIRONMENT_ID are right after that." />

Your badge will then have the form:
\`https://img.shields.io/vso/release/ORGANIZATION/PROJECT_ID/DEFINITION_ID/ENVIRONMENT_ID.svg\`.
`

export default class AzureDevOpsRelease extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'azure-devops/release',
    pattern: ':organization/:projectId/:definitionId/:environmentId',
  }

  static openApi = {
    '/azure-devops/release/{organization}/{projectId}/{definitionId}/{environmentId}':
      {
        get: {
          summary: 'Azure DevOps releases',
          description,
          parameters: pathParams(
            {
              name: 'organization',
              example: 'totodem',
            },
            {
              name: 'projectId',
              example: '8cf3ec0e-d0c2-4fcd-8206-ad204f254a96',
            },
            {
              name: 'definitionId',
              example: '1',
            },
            {
              name: 'environmentId',
              example: '1',
            },
          ),
        },
      },
  }

  static defaultBadgeData = { label: 'deployment' }

  async handle({ organization, projectId, definitionId, environmentId }) {
    // Microsoft documentation: ?
    const props = await fetch(this, {
      url: `https://vsrm.dev.azure.com/${organization}/_apis/public/Release/badge/${projectId}/${definitionId}/${environmentId}`,
      httpErrors: {
        400: 'project not found',
        404: 'user or environment not found',
        500: 'inaccessible or definition not found',
      },
    })
    return renderBuildStatusBadge(props)
  }
}
