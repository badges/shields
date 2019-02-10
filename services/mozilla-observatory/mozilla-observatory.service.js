'use strict'

const { BaseJsonService } = require('..')

const Joi = require('joi')
const schema = Joi.object({
  state: Joi.string()
    .valid('ABORTED', 'FAILED', 'FINISHED', 'PENDING', 'STARTING', 'RUNNING')
    .required(),
  grade: Joi.alternatives()
    .when('state', {
      is: 'FINISHED',
      then: Joi.string().regex(/^[ABCDEF][+-]?$/),
      otherwise: Joi.only(null),
    })
    .required(),
  score: Joi.alternatives()
    .when('state', {
      is: 'FINISHED',
      then: Joi.number()
        .integer()
        .min(0)
        .max(200),
      otherwise: Joi.only(null),
    })
    .required(),
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
      pattern: ':which(grade|grade-score)/:host',
      queryParams: ['publish'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Mozilla HTTP Observatory Grade',
        namedParams: { which: 'grade', host: 'github.com' },
        staticPreview: this.render({
          state: 'FINISHED',
          grade: 'A+',
          score: 115,
        }),
        keywords: ['mozilla', 'observatory', 'scanner', 'security'],
      },
      {
        title: 'Mozilla HTTP Observatory Grade (with score)',
        namedParams: { which: 'grade-score', host: 'github.com' },
        staticPreview: this.render({
          state: 'FINISHED',
          grade: 'A+',
          score: 115,
        }),
        keywords: ['mozilla', 'observatory', 'scanner', 'security'],
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'observatory',
    }
  }

  async fetch({ host, publish }) {
    return this._requestJson({
      schema,
      url: `https://http-observatory.security.mozilla.org/api/v1/analyze`,
      options: {
        method: 'POST',
        qs: { host },
        form: { hidden: !publish },
      },
    })
  }

  async handle({ which, host }, { publish }) {
    const { state, grade, score } = await this.fetch({ host, publish })
    return this.constructor.render({ which, state, grade, score })
  }

  static render({ which, state, grade, score }) {
    if (state !== 'FINISHED') {
      return {
        message: state.toLowerCase(),
        color: 'lightgrey',
      }
    }
    const letter = grade[0].toLowerCase()
    const colorMap = {
      a: 'brightgreen',
      b: 'green',
      c: 'yellow',
      d: 'orange',
      e: 'orange', // Handles legacy grade
      f: 'red',
    }
    return {
      message: which === 'grade' ? grade : `${grade} (${score}/100)`,
      color: colorMap[letter],
    }
  }
}
