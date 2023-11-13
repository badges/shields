import Joi from 'joi'
import { pathParams } from '../index.js'
import { coveragePercentage as coveragePercentageColor } from '../color-formatters.js'
import AzureDevOpsBase from './azure-devops-base.js'

const description = `
[Azure Devops](https://dev.azure.com/) (formerly VSO, VSTS) is Microsoft Azure's CI/CD platform.

To obtain your own badge, you need to get 3 pieces of information:
\`ORGANIZATION\`, \`PROJECT_ID\` and \`DEFINITION_ID\`.

First, you need to select your build definition and look at the url:

<img
  src="https://user-images.githubusercontent.com/3749820/47259976-e2d9ec80-d4b2-11e8-92cc-7c81089a7a2c.png"
  alt="ORGANIZATION is after the dev.azure.com part, PROJECT is right after that, DEFINITION_ID is at the end after the id= part." />

Your badge will then have the form:
\`https://img.shields.io/azure-devops/coverage/ORGANIZATION/PROJECT/DEFINITION_ID.svg\`.

Optionally, you can specify a named branch:
\`https://img.shields.io/azure-devops/coverage/ORGANIZATION/PROJECT/DEFINITION_ID/NAMED_BRANCH.svg\`.
`

const buildCodeCoverageSchema = Joi.object({
  coverageData: Joi.array()
    .items(
      Joi.object({
        coverageStats: Joi.array()
          .items(
            Joi.object({
              label: Joi.string().required(),
              total: Joi.number().required(),
              covered: Joi.number().required(),
            }),
          )
          .min(1)
          .required(),
      }),
    )
    .required(),
}).required()

export default class AzureDevOpsCoverage extends AzureDevOpsBase {
  static category = 'coverage'

  static route = {
    base: 'azure-devops/coverage',
    pattern: ':organization/:project/:definitionId/:branch*',
  }

  static openApi = {
    '/azure-devops/coverage/{organization}/{project}/{definitionId}': {
      get: {
        summary: 'Azure DevOps coverage',
        description,
        parameters: pathParams(
          {
            name: 'organization',
            example: 'swellaby',
          },
          {
            name: 'project',
            example: 'opensource',
          },
          {
            name: 'definitionId',
            example: '25',
          },
        ),
      },
    },
    '/azure-devops/coverage/{organization}/{project}/{definitionId}/{branch}': {
      get: {
        summary: 'Azure DevOps coverage (branch)',
        description,
        parameters: pathParams(
          {
            name: 'organization',
            example: 'swellaby',
          },
          {
            name: 'project',
            example: 'opensource',
          },
          {
            name: 'definitionId',
            example: '25',
          },
          {
            name: 'branch',
            example: 'master',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'coverage' }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentageColor(coverage),
    }
  }

  async handle({ organization, project, definitionId, branch }) {
    const httpErrors = {
      404: 'build pipeline or coverage not found',
    }
    const buildId = await this.getLatestCompletedBuildId(
      organization,
      project,
      definitionId,
      branch,
      httpErrors,
    )
    // Microsoft documentation: https://docs.microsoft.com/en-us/rest/api/azure/devops/test/code%20coverage/get%20build%20code%20coverage?view=azure-devops-rest-5.0
    const url = `https://dev.azure.com/${organization}/${project}/_apis/test/codecoverage`
    const options = {
      searchParams: {
        buildId,
        'api-version': '5.0-preview.1',
      },
    }
    const json = await this.fetch({
      url,
      options,
      schema: buildCodeCoverageSchema,
      httpErrors,
    })

    let covered = 0
    let total = 0
    json.coverageData.forEach(cd => {
      cd.coverageStats.forEach(coverageStat => {
        if (coverageStat.label === 'Line' || coverageStat.label === 'Lines') {
          covered += coverageStat.covered
          total += coverageStat.total
        }
      })
    })
    const coverage = covered ? (covered / total) * 100 : 0
    return this.constructor.render({ coverage })
  }
}
