import Joi from 'joi'
import { BaseJsonService, queryParam, pathParam } from '../index.js'

const schema = Joi.object({
  state: Joi.string()
    .valid('ABORTED', 'FAILED', 'FINISHED', 'PENDING', 'STARTING', 'RUNNING')
    .required(),
  grade: Joi.alternatives()
    .conditional('state', {
      is: 'FINISHED',
      then: Joi.string().regex(/^[ABCDEF][+-]?$/),
      otherwise: Joi.valid(null),
    })
    .required(),
  score: Joi.alternatives()
    .conditional('state', {
      is: 'FINISHED',
      then: Joi.number().integer().min(0).max(200),
      otherwise: Joi.valid(null),
    })
    .required(),
}).required()

const queryParamSchema = Joi.object({
  publish: Joi.equal(''),
}).required()

const description = `
The [Mozilla HTTP Observatory](https://observatory.mozilla.org)
is a set of security tools to analyze your website
and inform you if you are utilizing the many available methods to secure it.
`

const publishDescription = `
By default the scan result is hidden from the public result list.
You can activate the publication of the scan result
by setting the \`publish\` parameter.

The badge returns a cached site result if the site has been scanned anytime in the previous 24 hours.
If you need to force invalidating the cache,
you can to do it manually through the [Mozilla Observatory Website](https://observatory.mozilla.org)
`

export default class MozillaObservatory extends BaseJsonService {
  // TODO: Once created, change to a more appropriate category,
  // see https://github.com/badges/shields/pull/2926#issuecomment-460777017
  static category = 'monitoring'

  static route = {
    base: 'mozilla-observatory',
    pattern: ':format(grade|grade-score)/:host',
    queryParamSchema,
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
          queryParam({
            name: 'publish',
            schema: { type: 'boolean' },
            example: null,
            description: publishDescription,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'observatory',
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
      url: 'https://http-observatory.security.mozilla.org/api/v1/analyze',
      options: {
        method: 'POST',
        searchParams: { host },
        form: { hidden: !publish },
      },
    })
  }

  async handle({ format, host }, { publish }) {
    const { state, grade, score } = await this.fetch({ host, publish })
    return this.constructor.render({ format, state, grade, score })
  }
}
