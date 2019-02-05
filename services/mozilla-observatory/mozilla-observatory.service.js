'use strict'

const label = 'observatory'
const { BaseJsonService } = require('..')

const Joi = require('joi')
const schema = Joi.object({
  grade: Joi.string()
    .regex(/^[abcdef]$/i)
    .required(),
  score: Joi.number().required(),
}).required()

module.exports = class MozillaObservatory extends BaseJsonService {
  static get category() {
    // TODO: Once created, change to a more appropriate category,
    // see https://github.com/badges/shields/pull/2926#issuecomment-460777017
    return 'monitoring'
  }

  static get route() {
    return {
      base: 'mozilla-observatory',
      pattern: ':host',
    }
  }

  static get examples() {
    return [
      {
        title: 'Mozilla HTTP Observatory Scanner',
        namedParams: { host: 'github.com' },
        staticPreview: this.render({ grade: 'A+', score: 115 }),
        keywords: ['mozilla', 'observatory', 'scanner', 'security'],
      },
    ]
  }

  async fetch({ host }) {
    return this._requestJson({
      schema,
      url: `https://http-observatory.security.mozilla.org/api/v1/analyze?host=${host}`,
    })
  }

  async handle({ host }) {
    const { grade, score } = await this.fetch({ host })
    return this.constructor.render({ grade, score })
  }

  static render({ grade, score }) {
    const letter = grade[0].toLowerCase()
    // https://github.com/mozilla/http-observatory-website/blob/master/css/httpobs.css
    const colorMap = {
      a: '2d882d',
      b: 'aaaa39',
      c: 'aa7039',
      d: '652770',
      e: '652770', // Handles legacy grade
      f: 'aa3939',
    }
    return {
      message: `${grade} (${score}/100)`,
      label,
      color: colorMap[letter],
    }
  }
}
