import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  version: Joi.string().required(),
  status: Joi.string().valid('ok').required(),
}).required()

export default class JitPackVersion extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'jitpack/v',
    pattern: ':vcs(github|bitbucket|gitlab|gitee)/:user/:repo',
  }

  static examples = [
    {
      title: 'JitPack',
      namedParams: {
        vcs: 'github',
        user: 'jitpack',
        repo: 'maven-simple',
      },
      staticPreview: renderVersionBadge({ version: 'v1.1' }),
      keywords: ['java', 'maven'],
    },
  ]

  static defaultBadgeData = { label: 'jitpack' }

  async fetch({ vcs, user, repo }) {
    const url = `https://jitpack.io/api/builds/com.${vcs}.${user}/${repo}/latest`

    return this._requestJson({
      schema,
      url,
      errorMessages: { 401: 'project not found or private' },
    })
  }

  async handle({ vcs, user, repo }) {
    const { version } = await this.fetch({ vcs, user, repo })
    return renderVersionBadge({ version })
  }
}
