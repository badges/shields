import Joi from 'joi'
import { url } from '../validators.js'
import { BaseJsonService, pathParam, queryParam } from '../index.js'

const queryParamSchema = Joi.object({
  baseUrl: url,
}).required()

const schema = Joi.object({
  status: Joi.equal('NEW', 'MERGED', 'ABANDONED').required(),
}).required()

export default class Gerrit extends BaseJsonService {
  static category = 'issue-tracking'
  static route = { base: 'gerrit', pattern: ':changeId', queryParamSchema }
  static openApi = {
    '/gerrit/{changeId}': {
      get: {
        summary: 'Gerrit change status',
        parameters: [
          pathParam({
            name: 'changeId',
            example: '1011478',
          }),
          queryParam({
            name: 'baseUrl',
            example: 'https://android-review.googlesource.com',
            required: true,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'gerrit' }

  static getColor({ displayStatus }) {
    if (displayStatus === 'new') {
      return '2cbe4e'
    } else if (displayStatus === 'merged') {
      return 'blueviolet'
    } else if (displayStatus === 'abandoned') {
      return 'red'
    }
  }

  static render({ changeId, status }) {
    const displayStatus = status.toLowerCase()
    const color = this.getColor({ displayStatus })
    return {
      label: `change ${changeId}`,
      message: displayStatus,
      color,
    }
  }

  /*
   * To prevent against Cross Site Script Inclusion (XSSI) attacks, Gerrit's
   * JSON response body starts with a magic prefix line that must be stripped
   * before feeding the rest of the response body to a JSON parser.
   * See https://gerrit-review.googlesource.com/Documentation/rest-api.html#output
   */
  _parseJson(buffer) {
    const bufferWithoutPrefixLine = buffer.substring(buffer.indexOf('\n') + 1)
    return super._parseJson(bufferWithoutPrefixLine)
  }

  async fetch({ changeId, baseUrl }) {
    return this._requestJson({
      schema,
      url: `${baseUrl}/changes/${changeId}`,
      httpErrors: {
        404: 'change not found',
      },
    })
  }

  async handle({ changeId }, { baseUrl }) {
    const data = await this.fetch({ changeId, baseUrl })
    return this.constructor.render({
      changeId,
      status: data.status,
    })
  }
}
