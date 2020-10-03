'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseSvgScrapingService } = require('..')

const schema = Joi.object({
  message: nonNegativeInteger,
}).required()

module.exports = class RepologyRepositories extends BaseSvgScrapingService {
  static category = 'platform-support'

  static route = {
    base: 'repology/repositories',
    pattern: ':projectName',
  }

  static examples = [
    {
      title: 'Repology - Repositories',
      namedParams: { projectName: 'starship' },
      staticPreview: this.render({ repositoryCount: '18' }),
    },
  ]

  static defaultBadgeData = {
    label: 'repositories',
    color: 'blue',
  }

  static render({ repositoryCount }) {
    return {
      message: metric(repositoryCount),
    }
  }

  async handle({ projectName }) {
    const { message: repositoryCount } = await this._requestSvg({
      schema,
      url: `https://repology.org/badge/tiny-repos/${projectName}.svg`,
    })

    return this.constructor.render({ repositoryCount })
  }
}
