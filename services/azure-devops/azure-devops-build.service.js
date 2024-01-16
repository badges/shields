import Joi from 'joi'
import { renderBuildStatusBadge } from '../build-status.js'
import {
  BaseSvgScrapingService,
  NotFound,
  queryParam,
  pathParam,
} from '../index.js'
import { fetch } from './azure-devops-helpers.js'

const queryParamSchema = Joi.object({
  stage: Joi.string(),
  job: Joi.string(),
})

const description = `
[Azure Devops](https://dev.azure.com/) (formerly VSO, VSTS) is Microsoft Azure's CI/CD platform.

A badge requires three pieces of information:
\`ORGANIZATION\`, \`PROJECT_ID\` and \`DEFINITION_ID\`.

To start, edit your build definition and look at the url:

<img
  src="https://user-images.githubusercontent.com/3749820/47259976-e2d9ec80-d4b2-11e8-92cc-7c81089a7a2c.png"
  alt="ORGANIZATION is after the dev.azure.com part, PROJECT_NAME is right after that, DEFINITION_ID is at the end after the id= part." />

Then use the Azure DevOps REST API to translate the
\`PROJECT_NAME\` to a \`PROJECT_ID\`.

Navigate to \`https://dev.azure.com/ORGANIZATION/_apis/projects/PROJECT_NAME\`

<img
  src="https://user-images.githubusercontent.com/3749820/47266325-1d846900-d535-11e8-9211-2ee72fb91877.png"
  alt="PROJECT_ID is in the id property of the API response." />
`

export default class AzureDevOpsBuild extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'azure-devops/build',
    pattern: ':organization/:projectId/:definitionId/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/azure-devops/build/{organization}/{projectId}/{definitionId}': {
      get: {
        summary: 'Azure DevOps builds',
        description,
        parameters: [
          pathParam({
            name: 'organization',
            example: 'totodem',
          }),
          pathParam({
            name: 'projectId',
            example: '8cf3ec0e-d0c2-4fcd-8206-ad204f254a96',
          }),
          pathParam({
            name: 'definitionId',
            example: '2',
          }),
          queryParam({
            name: 'stage',
            example: 'Successful Stage',
          }),
          queryParam({
            name: 'job',
            example: 'Successful Job',
          }),
        ],
      },
    },
    '/azure-devops/build/{organization}/{projectId}/{definitionId}/{branch}': {
      get: {
        summary: 'Azure DevOps builds (branch)',
        description,
        parameters: [
          pathParam({
            name: 'organization',
            example: 'totodem',
          }),
          pathParam({
            name: 'projectId',
            example: '8cf3ec0e-d0c2-4fcd-8206-ad204f254a96',
          }),
          pathParam({
            name: 'definitionId',
            example: '2',
          }),
          pathParam({
            name: 'branch',
            example: 'master',
          }),
          queryParam({
            name: 'stage',
            example: 'Successful Stage',
          }),
          queryParam({
            name: 'job',
            example: 'Successful Job',
          }),
        ],
      },
    },
  }

  async handle(
    { organization, projectId, definitionId, branch },
    { stage, job },
  ) {
    // Microsoft documentation: https://docs.microsoft.com/en-us/rest/api/vsts/build/status/get
    const { status } = await fetch(this, {
      url: `https://dev.azure.com/${organization}/${projectId}/_apis/build/status/${definitionId}`,
      searchParams: {
        branchName: branch,
        stageName: stage,
        jobName: job,
      },
      httpErrors: {
        404: 'user or project not found',
      },
    })
    if (status === 'set up now') {
      throw new NotFound({ prettyMessage: 'definition not found' })
    }
    if (status === 'unknown') {
      throw new NotFound({ prettyMessage: 'project not found' })
    }
    return renderBuildStatusBadge({ status })
  }
}
