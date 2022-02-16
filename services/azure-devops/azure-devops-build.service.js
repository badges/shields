import Joi from 'joi'
import { renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService, NotFound } from '../index.js'
import { keywords, fetch } from './azure-devops-helpers.js'

const queryParamSchema = Joi.object({
  stage: Joi.string(),
  job: Joi.string(),
})

const documentation = `
<p>
  A badge requires three pieces of information: <code>ORGANIZATION</code>,
  <code>PROJECT_ID</code> and <code>DEFINITION_ID</code>.
</p>
<p>
  To start, edit your build definition and look at the url:
</p>
<img
  src="https://user-images.githubusercontent.com/3749820/47259976-e2d9ec80-d4b2-11e8-92cc-7c81089a7a2c.png"
  alt="ORGANIZATION is after the dev.azure.com part, PROJECT_NAME is right after that, DEFINITION_ID is at the end after the id= part." />
<p>
  Then use the Azure DevOps REST API to translate the
  <code>PROJECT_NAME</code> to a <code>PROJECT_ID</code>.
</p>
<p>
  Navigate to <code>https://dev.azure.com/ORGANIZATION/_apis/projects/PROJECT_NAME</code>
</p>
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

  static examples = [
    {
      title: 'Azure DevOps builds',
      pattern: ':organization/:projectId/:definitionId',
      namedParams: {
        organization: 'totodem',
        projectId: '8cf3ec0e-d0c2-4fcd-8206-ad204f254a96',
        definitionId: '2',
      },
      staticPreview: renderBuildStatusBadge({ status: 'succeeded' }),
      keywords,
      documentation,
    },
    {
      title: 'Azure DevOps builds (branch)',
      pattern: ':organization/:projectId/:definitionId/:branch',
      namedParams: {
        organization: 'totodem',
        projectId: '8cf3ec0e-d0c2-4fcd-8206-ad204f254a96',
        definitionId: '2',
        branch: 'master',
      },
      staticPreview: renderBuildStatusBadge({ status: 'succeeded' }),
      keywords,
      documentation,
    },
    {
      title: 'Azure DevOps builds (stage)',
      namedParams: {
        organization: 'totodem',
        projectId: '8cf3ec0e-d0c2-4fcd-8206-ad204f254a96',
        definitionId: '5',
      },
      queryParams: {
        stage: 'Successful Stage',
      },
      staticPreview: renderBuildStatusBadge({ status: 'succeeded' }),
      keywords,
      documentation,
    },
    {
      title: 'Azure DevOps builds (job)',
      namedParams: {
        organization: 'totodem',
        projectId: '8cf3ec0e-d0c2-4fcd-8206-ad204f254a96',
        definitionId: '5',
      },
      queryParams: {
        stage: 'Successful Stage',
        job: 'Successful Job',
      },
      staticPreview: renderBuildStatusBadge({ status: 'succeeded' }),
      keywords,
      documentation,
    },
  ]

  async handle(
    { organization, projectId, definitionId, branch },
    { stage, job }
  ) {
    // Microsoft documentation: https://docs.microsoft.com/en-us/rest/api/vsts/build/status/get
    const { status } = await fetch(this, {
      url: `https://dev.azure.com/${organization}/${projectId}/_apis/build/status/${definitionId}`,
      searchParams: {
        branchName: branch,
        stageName: stage,
        jobName: job,
      },
      errorMessages: {
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
