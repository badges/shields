'use strict'

const Joi = require('joi')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')
const BaseSvgScrapingService = require('../base-svg-scraping')
const { NotFound } = require('../errors')

const schema = Joi.object({
  message: Joi.alternatives()
    .try([Joi.string().regex(/^[0-9]+%$/), Joi.equal('!')])
    .required(),
}).required()

module.exports = class CodacyCoverage extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'codacy/coverage',
      format: '(?!grade/)([^/]+)(?:/(.+))?',
      capture: ['projectId', 'branch'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Codacy coverage',
        urlPattern: ':projectId',
        staticExample: this.render({ percentage: 90 }),
        exampleUrl: '59d607d0e311408885e418004068ea58',
      },
      {
        title: 'Codacy branch coverage',
        urlPattern: ':projectId/:branch',
        staticExample: this.render({ percentage: 90 }),
        exampleUrl: '59d607d0e311408885e418004068ea58/master',
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'coverage',
    }
  }

  static render({ percentage }) {
    return {
      message: `${percentage}%`,
      color: coveragePercentageColor(percentage),
    }
  }

  static transform({ coverageString }) {
    return {
      percentage: parseFloat(coverageString.replace(/%$/, '')),
    }
  }

  async handle({ projectId, branch }) {
    const { message: coverageString } = await this._requestSvg({
      schema,
      url: `https://api.codacy.com/project/badge/coverage/${encodeURIComponent(
        projectId
      )}`,
      options: { qs: { branch } },
      valueMatcher: /text-anchor="middle">([^<>]+)<\/text>/,
    })
    if (coverageString === '!') {
      throw new NotFound({
        prettyMessage: 'project or branch not found',
      })
    }
    const { percentage } = this.constructor.transform({ coverageString })
    return this.constructor.render({ percentage })
  }
}
