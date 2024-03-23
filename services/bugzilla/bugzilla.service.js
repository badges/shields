import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { BaseJsonService, pathParam, queryParam } from '../index.js'

const queryParamSchema = Joi.object({
  baseUrl: optionalUrl,
}).required()

const schema = Joi.object({
  bugs: Joi.array()
    .items(
      Joi.object({
        status: Joi.string().required(),
        resolution: Joi.string().allow('').required(),
      }).required(),
    )
    .min(1)
    .required(),
}).required()

const description = `
Use the <code>baseUrl</code> query parameter to target different Bugzilla deployments.
If your Bugzilla badge errors, it might be because you are trying to load a private bug.
`

export default class Bugzilla extends BaseJsonService {
  static category = 'issue-tracking'
  static route = { base: 'bugzilla', pattern: ':bugNumber', queryParamSchema }

  static openApi = {
    '/bugzilla/{bugNumber}': {
      get: {
        summary: 'Bugzilla bug status',
        description,
        parameters: [
          pathParam({
            name: 'bugNumber',
            example: '545424',
          }),
          queryParam({
            name: 'baseUrl',
            example: 'https://bugs.eclipse.org/bugs',
            description:
              'When not specified, this will default to `https://bugzilla.mozilla.org`.',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'bugzilla' }

  static getDisplayStatus({ status, resolution }) {
    let displayStatus =
      status === 'RESOLVED' ? resolution.toLowerCase() : status.toLowerCase()
    if (displayStatus === 'worksforme') {
      displayStatus = 'works for me'
    }
    if (displayStatus === 'wontfix') {
      displayStatus = "won't fix"
    }
    return displayStatus
  }

  static getColor({ displayStatus }) {
    const colorMap = {
      unconfirmed: 'blue',
      new: 'blue',
      assigned: 'green',
      fixed: 'brightgreen',
      invalid: 'yellow',
      "won't fix": 'orange',
      duplicate: 'lightgrey',
      'works for me': 'yellowgreen',
      incomplete: 'red',
    }
    if (displayStatus in colorMap) {
      return colorMap[displayStatus]
    }
    return 'lightgrey'
  }

  static render({ bugNumber, status, resolution }) {
    const displayStatus = this.getDisplayStatus({ status, resolution })
    const color = this.getColor({ displayStatus })
    return {
      label: `bug ${bugNumber}`,
      message: displayStatus,
      color,
    }
  }

  async fetch({ bugNumber, baseUrl }) {
    return this._requestJson({
      schema,
      url: `${baseUrl}/rest/bug/${bugNumber}`,
    })
  }

  async handle({ bugNumber }, { baseUrl = 'https://bugzilla.mozilla.org' }) {
    const data = await this.fetch({ bugNumber, baseUrl })
    return this.constructor.render({
      bugNumber,
      status: data.bugs[0].status,
      resolution: data.bugs[0].resolution,
    })
  }
}
