import Joi from 'joi'
import { coveragePercentage, letterScore } from '../color-formatters.js'
import { BaseJsonService, NotFound } from '../index.js'
import { keywords, isLetterGrade, fetchRepo } from './codeclimate-common.js'

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

  static examples = [
    {
      title: 'Code Climate coverage',
      namedParams: {
        format: 'coverage',
        user: 'codeclimate',
        repo: 'codeclimate',
      },
      staticPreview: this.render({
        format: 'coverage',
        percentage: 95.123,
        letter: 'A',
      }),
      keywords,
    },
  ]

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
    const {
      id: repoId,
      relationships: {
        latest_default_branch_test_report: { data: testReportInfo },
      },
    } = await fetchRepo(this, { user, repo })
    if (testReportInfo === null) {
      throw new NotFound({ prettyMessage: 'test report not found' })
    }
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
