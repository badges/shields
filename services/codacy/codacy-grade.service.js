'use strict'

const Joi = require('joi')
const { BaseSvgScrapingService } = require('..')
const { codacyGrade } = require('./codacy-helpers')

const schema = Joi.object({ message: codacyGrade }).required()

module.exports = class CodacyGrade extends BaseSvgScrapingService {
  static category = 'analysis'
  static route = { base: 'codacy/grade', pattern: ':projectId/:branch*' }

  static examples = [
    {
      title: 'Codacy grade',
      pattern: ':projectId',
      namedParams: { projectId: 'e27821fb6289410b8f58338c7e0bc686' },
      staticPreview: this.render({ grade: 'A' }),
    },
    {
      title: 'Codacy branch grade',
      pattern: ':projectId/:branch',
      namedParams: {
        projectId: 'e27821fb6289410b8f58338c7e0bc686',
        branch: 'master',
      },
      staticPreview: this.render({ grade: 'A' }),
    },
  ]

  static defaultBadgeData = { label: 'code quality' }

  static render({ grade }) {
    const color = {
      A: 'brightgreen',
      B: 'green',
      C: 'yellowgreen',
      D: 'yellow',
      E: 'orange',
      F: 'red',
    }[grade]

    return {
      message: grade,
      color,
    }
  }

  async handle({ projectId, branch }) {
    const { message: grade } = await this._requestSvg({
      schema,
      url: `https://api.codacy.com/project/badge/grade/${encodeURIComponent(
        projectId
      )}`,
      options: { qs: { branch } },
      errorMessages: { 404: 'project or branch not found' },
      valueMatcher: /visibility="hidden">([^<>]+)<\/text>/,
    })
    return this.constructor.render({ grade })
  }
}
