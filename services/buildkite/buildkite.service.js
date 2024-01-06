import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService, pathParams } from '../index.js'

// unknown is a valid 'other' status for Buildkite
const schema = Joi.object({
  status: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
}).required()

export default class Buildkite extends BaseJsonService {
  static category = 'build'
  static route = { base: 'buildkite', pattern: ':identifier/:branch*' }

  static openApi = {
    '/buildkite/{identifier}': {
      get: {
        summary: 'Buildkite',
        parameters: pathParams({
          name: 'identifier',
          example: '3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489',
        }),
      },
    },
    '/buildkite/{identifier}/{branch}': {
      get: {
        summary: 'Buildkite (branch)',
        parameters: pathParams(
          {
            name: 'identifier',
            example: '3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489',
          },
          {
            name: 'branch',
            example: 'master',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'build' }

  async fetch({ identifier, branch }) {
    const url = `https://badge.buildkite.com/${identifier}.json`
    const options = { searchParams: { branch } }
    return this._requestJson({
      schema,
      url,
      options,
    })
  }

  async handle({ identifier, branch }) {
    const json = await this.fetch({ identifier, branch })
    return renderBuildStatusBadge({ status: json.status })
  }
}
