import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  version: Joi.string().required(),
  status: Joi.string().valid('ok').required(),
}).required()

export default class JitPackVersion extends BaseJsonService {
  static category = 'version'

  // Changed endpoint to allow any groupId, custom domains included
  // See: https://github.com/badges/shields/issues/8312
  static route = {
    base: 'jitpack/version',
    pattern: ':groupId/:artifactId',
  }

  static openApi = {
    '/jitpack/version/{groupId}/{artifactId}': {
      get: {
        summary: 'JitPack',
        parameters: pathParams(
          {
            name: 'groupId',
            example: 'com.github.jitpack',
          },
          {
            name: 'artifactId',
            example: 'maven-simple',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'jitpack' }

  async fetch({ groupId, artifactId }) {
    const url = `https://jitpack.io/api/builds/${groupId}/${artifactId}/latestOk`

    return this._requestJson({
      schema,
      url,
      httpErrors: { 401: 'project not found or private' },
    })
  }

  async handle({ groupId, artifactId }) {
    const { version } = await this.fetch({ groupId, artifactId })
    return renderVersionBadge({ version })
  }
}
