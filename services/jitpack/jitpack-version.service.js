import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService } from '../index.js'

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

  static examples = [
    {
      title: 'JitPack',
      namedParams: {
        groupId: 'com.github.jitpack',
        artifactId: 'maven-simple',
      },
      staticPreview: renderVersionBadge({ version: 'v1.1' }),
      keywords: ['java', 'maven'],
    },
  ]

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
