import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService } from '../index.js'

// unknown is a valid 'other' status for Buildkite
const schema = Joi.object({
  status: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
}).required()

export default class Buildkite extends BaseJsonService {
  static category = 'build'
  static route = { base: 'buildkite', pattern: ':identifier/:branch*' }

  static examples = [
    {
      title: 'Buildkite',
      pattern: ':identifier',
      namedParams: {
        identifier: '3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489',
      },
      staticPreview: renderBuildStatusBadge({ status: 'passing' }),
    },
    {
      title: 'Buildkite (branch)',
      pattern: ':identifier/:branch',
      namedParams: {
        identifier: '3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489',
        branch: 'master',
      },
      staticPreview: renderBuildStatusBadge({ status: 'passing' }),
    },
  ]

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
