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

  static get route() {
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
        pattern: ':projectId',
        staticExample: this.render({ percentage: 90 }),
        exampleUrl: '59d607d0e311408885e418004068ea58',
      },
      {
        title: 'Codacy branch coverage',
        pattern: ':projectId/:branch',
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
      errorMessages: {
        404: 'project not found',
      },
    })

    // When sending an invalid branch, Codacy ignores the branch, failing
    // silently, so we can't provide an error message for this case.

    if (coverageString === '!') {
      throw new NotFound({
        prettyMessage: 'not enabled for this project',
      })
    }

    const { percentage } = this.constructor.transform({ coverageString })
    return this.constructor.render({ percentage })
  }
}
