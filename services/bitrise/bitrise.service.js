import Joi from 'joi'
import { BaseJsonService, pathParam, queryParam } from '../index.js'

// https://devcenter.bitrise.io/api/app-status-badge/
const schema = Joi.object({
  status: Joi.equal('success', 'error', 'unknown'),
}).required()

const queryParamSchema = Joi.object({
  token: Joi.string().required(),
}).required()

export default class Bitrise extends BaseJsonService {
  static category = 'build'
  static route = {
    base: 'bitrise',
    pattern: ':appId/:branch?',
    queryParamSchema,
  }

  static openApi = {
    '/bitrise/{appId}': {
      get: {
        summary: 'Bitrise',
        parameters: [
          pathParam({
            name: 'appId',
            example: '4a2b10a819d12b67',
          }),
          queryParam({
            name: 'token',
            example: 'abc123def456',
            required: true,
          }),
        ],
      },
    },
    '/bitrise/{appId}/{branch}': {
      get: {
        summary: 'Bitrise (branch)',
        parameters: [
          pathParam({
            name: 'appId',
            example: 'e736852157296019',
          }),
          pathParam({
            name: 'branch',
            example: 'develop',
          }),
          queryParam({
            name: 'token',
            example: 'abc123def456',
            required: true,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'bitrise' }

  static render({ status }) {
    const color = {
      success: 'brightgreen',
      error: 'red',
      unknown: 'lightgrey',
    }[status]

    let message
    if (status === 'unknown') {
      // This is the only case mentioned in the API docs. If we get feedback
      // it's often wrong we can update this.
      message = 'branch not found'
    } else {
      message = status
    }

    return { message, color }
  }

  async fetch({ appId, branch, token }) {
    return this._requestJson({
      url: `https://app.bitrise.io/app/${encodeURIComponent(
        appId,
      )}/status.json`,
      options: { searchParams: { token, branch } },
      schema,
      httpErrors: {
        403: 'app not found or invalid token',
      },
    })
  }

  async handle({ appId, branch }, { token }) {
    const { status } = await this.fetch({ appId, branch, token })
    return this.constructor.render({ status })
  }
}
