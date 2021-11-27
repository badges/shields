import Joi from 'joi'
import { coveragePercentage as coveragePercentageColor } from '../color-formatters.js'
import AzureDevOpsBase from './azure-devops-base.js'
import { keywords } from './azure-devops-helpers.js'

const documentation = `
<p>
  To obtain your own badge, you need to get 3 pieces of information:
  <code>ORGANIZATION</code>, <code>PROJECT</code> and <code>DEFINITION_ID</code>.
</p>
<p>
  First, you need to select your build definition and look at the url:
</p>
<img
  src="https://user-images.githubusercontent.com/3749820/47259976-e2d9ec80-d4b2-11e8-92cc-7c81089a7a2c.png"
  alt="ORGANIZATION is after the dev.azure.com part, PROJECT is right after that, DEFINITION_ID is at the end after the id= part." />
<p>
  Your badge will then have the form:
  <code>https://img.shields.io/azure-devops/coverage/ORGANIZATION/PROJECT/DEFINITION_ID.svg</code>.
</p>
<p>
  Optionally, you can specify a named branch:
  <code>https://img.shields.io/azure-devops/coverage/ORGANIZATION/PROJECT/DEFINITION_ID/NAMED_BRANCH.svg</code>.
</p>
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
            })
          )
          .min(1)
          .required(),
      })
    )
    .required(),
}).required()

export default class AzureDevOpsCoverage extends AzureDevOpsBase {
  static category = 'coverage'

  static route = {
    base: 'azure-devops/coverage',
    pattern: ':organization/:project/:definitionId/:branch*',
  }

  static examples = [
    {
      title: 'Azure DevOps coverage',
      pattern: ':organization/:project/:definitionId',
      namedParams: {
        organization: 'swellaby',
        project: 'opensource',
        definitionId: '25',
      },
      staticPreview: this.render({ coverage: 100 }),
      keywords,
      documentation,
    },
    {
      title: 'Azure DevOps coverage (branch)',
      pattern: ':organization/:project/:definitionId/:branch',
      namedParams: {
        organization: 'swellaby',
        project: 'opensource',
        definitionId: '25',
        branch: 'master',
      },
      staticPreview: this.render({ coverage: 100 }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'coverage' }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentageColor(coverage),
    }
  }

  async handle({ organization, project, definitionId, branch }) {
    const errorMessages = {
      404: 'build pipeline or coverage not found',
    }
    const buildId = await this.getLatestCompletedBuildId(
      organization,
      project,
      definitionId,
      branch,
      errorMessages
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
      errorMessages,
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
