import Joi from 'joi'
import { coveragePercentage, letterScore } from '../color-formatters.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'
import { isLetterGrade, fetchRepo } from './codeclimate-common.js'

const schema = Joi.object({
  data: Joi.object({
    attributes: Joi.object({
      covered_percent: Joi.number().required(),
      rating: Joi.object({
        letter: isLetterGrade,
      }).required(),
    }).required(),
  }).allow(null),
}).required()

export default class CodeclimateCoverage extends BaseJsonService {
  static category = 'coverage'
  static route = {
    base: 'codeclimate',
    pattern: ':format(coverage|coverage-letter)/:user/:repo',
  }

  static openApi = {
    '/codeclimate/{format}/{user}/{repo}': {
      get: {
        summary: 'Code Climate coverage',
        parameters: pathParams(
          {
            name: 'format',
            example: 'coverage',
            schema: { type: 'string', enum: this.getEnum('format') },
          },
          { name: 'user', example: 'codeclimate' },
          { name: 'repo', example: 'codeclimate' },
        ),
      },
    },
  }

  static render({ wantLetter, percentage, letter }) {
    if (wantLetter) {
      return {
        message: letter,
        color: letterScore(letter),
      }
    } else {
      return {
        message: `${percentage.toFixed(0)}%`,
        color: coveragePercentage(percentage),
      }
    }
  }

  async fetch({ user, repo }) {
    const repoInfos = await fetchRepo(this, { user, repo })
    const repoInfosWithTestReport = repoInfos.filter(
      repoInfo => repoInfo.relationships.latest_default_branch_test_report.data,
    )
    if (repoInfosWithTestReport.length === 0) {
      throw new NotFound({ prettyMessage: 'test report not found' })
    }
    const {
      id: repoId,
      relationships: {
        latest_default_branch_test_report: { data: testReportInfo },
      },
    } = repoInfosWithTestReport[0]
    const { data } = await this._requestJson({
      schema,
      url: `https://api.codeclimate.com/v1/repos/${repoId}/test_reports/${testReportInfo.id}`,
    })
    return data
  }

  async handle({ format, user, repo }) {
    const {
      attributes: {
        rating: { letter },
        covered_percent: percentage,
      },
    } = await this.fetch({ user, repo })

    return this.constructor.render({
      wantLetter: format === 'coverage-letter',
      letter,
      percentage,
    })
  }
}
