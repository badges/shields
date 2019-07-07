'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

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

const queryParamSchema = Joi.object({
  publish: Joi.equal(''),
}).required()

const documentation = `
<p>
  The <a href="https://observatory.mozilla.org">Mozilla HTTP Observatory</a>
  is a set of tools to analyze your website
  and inform you if you are utilizing the many available methods to secure it.
</p>
</p>
  By default the scan result is hidden from the public result list.
  You can activate the publication of the scan result
  by setting the <code>publish</code> parameter.
<p>
<p>
  The badge returns a cached site result if the site has been scanned anytime in the previous 24 hours.
  If you need to force invalidating the cache,
  you can to do it manually through the <a href="https://observatory.mozilla.org">Mozilla Observatory Website</a>
</p>
`

module.exports = class MozillaObservatory extends BaseJsonService {
  static get category() {
    // TODO: Once created, change to a more appropriate category,
    // see https://github.com/badges/shields/pull/2926#issuecomment-460777017
    return 'monitoring'
  }

  static get route() {
    return {
      base: 'mozilla-observatory',
      pattern: ':format(grade|grade-score)/:host',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Mozilla HTTP Observatory Grade',
        namedParams: { format: 'grade', host: 'github.com' },
        staticPreview: this.render({
          format: 'grade',
          state: 'FINISHED',
          grade: 'A+',
          score: 115,
        }),
        queryParams: { publish: null },
        keywords: ['scanner', 'security'],
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'observatory',
    }
  }

  static render({ format, state, grade, score }) {
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
      message: format === 'grade' ? grade : `${grade} (${score}/100)`,
      color: colorMap[letter],
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

  async handle({ format, host }, { publish }) {
    const { state, grade, score } = await this.fetch({ host, publish })
    return this.constructor.render({ format, state, grade, score })
  }
}
