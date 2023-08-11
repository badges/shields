import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { colorScale } from '../color-formatters.js'

const schema = Joi.object({
  score: Joi.number().min(0).required(),
}).required()

const ossfScorecardColorScale = colorScale(
  [2, 5, 8, 10],
  ['red', 'yellow', 'yellowgreen', 'green', 'brightgreen'],
)

export default class OSSFScorecard extends BaseJsonService {
  static category = 'analysis'

  static route = { base: 'ossf-scorecard', pattern: ':host/:orgName/:repoName' }

  static openApi = {
    '/ossf-scorecard/{host}/{orgName}/{repoName}': {
      get: {
        summary: 'OSSF-Scorecard Score',
        parameters: pathParams(
          {
            name: 'host',
            example: 'github.com',
          },
          {
            name: 'orgName',
            example: 'rohankh532',
          },
          {
            name: 'repoName',
            example: 'org-workflow-add',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'score' }

  static render({ score }) {
    return {
      message: score,
      color: ossfScorecardColorScale(score),
    }
  }

  async fetch({ host, orgName, repoName }) {
    return this._requestJson({
      schema,
      url: `https://api.securityscorecards.dev/projects/${host}/${orgName}/${repoName}`,
      httpErrors: {
        404: 'invalid repo path',
      },
    })
  }

  async handle({ host, orgName, repoName }) {
    const { score } = await this.fetch({ host, orgName, repoName })

    return this.constructor.render({ score })
  }
}
