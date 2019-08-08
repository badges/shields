'use strict'

const {
  coveragePercentage: coveragePercentageColor,
} = require('../color-formatters')
const { BasePuppetForgeModulesService } = require('./puppetforge-base')
const { NotFound } = require('..')

module.exports = class PuppetforgeModuleFeedback extends BasePuppetForgeModulesService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'puppetforge/f',
      pattern: ':user/:moduleName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Puppet Forge feedback score',
        namedParams: {
          user: 'camptocamp',
          moduleName: 'openssl',
        },
        staticPreview: this.render({ score: 61 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'score' }
  }

  static render({ score }) {
    return {
      message: `${score}%`,
      color: coveragePercentageColor(score),
    }
  }

  async handle({ user, moduleName }) {
    const data = await this.fetch({ user, moduleName })
    if (data.feedback_score == null) {
      throw new NotFound({ prettyMessage: 'unknown' })
    }
    return this.constructor.render({ score: data.feedback_score })
  }
}
