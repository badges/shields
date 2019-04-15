'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')
const { coveragePercentage, letterScore } = require('../color-formatters')
const { keywords, fetchRepo } = require('./codeclimate-common')

const schema = Joi.object({
  data: Joi.object({
    attributes: Joi.object({
      covered_percent: Joi.number().required(),
      rating: Joi.object({
        letter: Joi.equal('A', 'B', 'C', 'D', 'E', 'F').required(),
      }).required(),
    }).required(),
  }).allow(null),
}).required()

module.exports = class CodeclimateCoverage extends BaseJsonService {
  static get route() {
    return {
      base: 'codeclimate',
      pattern: ':which(coverage|coverage-letter)/:user/:repo',
    }
  }

  static get category() {
    return 'coverage'
  }

  static get examples() {
    return [
      {
        title: 'Code Climate coverage',
        namedParams: { which: 'coverage', user: 'jekyll', repo: 'jekyll' },
        staticPreview: this.render({
          which: 'coverage',
          percentage: 95.123,
          letter: 'A',
        }),
        keywords,
      },
    ]
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
      url: `https://api.codeclimate.com/v1/repos/${repoId}/test_reports/${
        testReportInfo.id
      }`,
      errorMessages: { 404: 'test report not found' },
    })
    return data
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

  async handle({ which, user, repo }) {
    const {
      attributes: {
        rating: { letter },
        covered_percent: percentage,
      },
    } = await this.fetch({ user, repo })

    return this.constructor.render({
      wantLetter: which === 'coverage-letter',
      letter,
      percentage,
    })
  }
}
