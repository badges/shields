import Joi from 'joi'
import { BaseJsonService, pathParam } from '../index.js'

const schema = Joi.object({
  grade: Joi.string()
    .regex(/^[ABCDEF][+-]?$/)
    .required(),
  score: Joi.number().integer().min(0).max(200).required(),
}).required()

const description = `
The [Mozilla HTTP Observatory](https://developer.mozilla.org/en-US/observatory)
is a set of security tools to analyze your website
and inform you if you are utilizing the many available methods to secure it.
`

export default class MozillaObservatory extends BaseJsonService {
  // TODO: Once created, change to a more appropriate category,
  // see https://github.com/badges/shields/pull/2926#issuecomment-460777017
  static category = 'monitoring'

  static route = {
    base: 'mozilla-observatory',
    pattern: ':format(grade|grade-score)/:host',
  }

  static openApi = {
    '/mozilla-observatory/{format}/{host}': {
      get: {
        summary: 'Mozilla HTTP Observatory Grade',
        description,
        parameters: [
          pathParam({
            name: 'format',
            example: 'grade',
            schema: { type: 'string', enum: this.getEnum('format') },
          }),
          pathParam({
            name: 'host',
            example: 'github.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'observatory',
  }

  static render({ format, grade, score }) {
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

  async fetch({ host }) {
    return this._requestJson({
      schema,
      url: 'https://observatory-api.mdn.mozilla.net/api/v2/scan',
      options: {
        method: 'POST',
        searchParams: { host },
      },
    })
  }

  async handle({ format, host }) {
    const scan = await this.fetch({ host })
    return this.constructor.render({
      format,
      grade: scan.grade,
      score: scan.score,
    })
  }
}
