'use strict'

const Joi = require('@hapi/joi')
const { letterGrades } = require('./codefactor-helpers')
const { BaseSvgScrapingService } = require('..')

const schema = Joi.object({
  message: Joi.allow(...Object.keys(letterGrades)).required(),
}).required()

module.exports = class CodeFactorGrade extends BaseSvgScrapingService {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'codefactor/grade',
      pattern: ':vcsType(github|bitbucket)/:user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'CodeFactor Grade',
        namedParams: {
          vcsType: 'github',
          user: 'pallets',
          repo: 'flask',
          branch: 'master',
        },
        staticPreview: this.render({ grade: 'B+' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'code quality',
    }
  }

  static render({ grade }) {
    return {
      message: grade,
      color: letterGrades[grade].color,
    }
  }

  async handle({ vcsType, user, repo, branch }) {
    const { message } = await this._requestSvg({
      schema,
      url: `https://codefactor.io/repository/${vcsType}/${user}/${repo}/badge/${branch ||
        ''}`,
      errorMessages: { 404: 'repo or branch not found' },
    })
    return this.constructor.render({ grade: message })
  }
}
