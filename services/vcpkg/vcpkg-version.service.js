import Joi from 'joi'
import { ConditionalGithubAuthV3Service } from '../github/github-auth-service.js'
import { fetchJsonFromRepo } from '../github/github-common-fetch.js'
import { renderVersionBadge } from '../version.js'
import { NotFound } from '../index.js'

const vcpkgManifestSchema = Joi.object({
  version: Joi.string().required(),
}).required()

export default class VcpkgVersion extends ConditionalGithubAuthV3Service {
  static category = 'version'

  static route = { base: 'vcpkg/v', pattern: ':portName' }

  static examples = [
    {
      title: 'Vcpkg',
      namedParams: { portName: 'entt' },
      staticPreview: this.render({ version: '3.11.1' }),
    },
  ]

  static defaultBadgeData = { label: 'vcpkg' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ portName }) {
    try {
      const { version } = await fetchJsonFromRepo(this, {
        schema: vcpkgManifestSchema,
        user: 'microsoft',
        repo: 'vcpkg',
        branch: 'master',
        filename: `ports/${portName}/vcpkg.json`,
      })
      return this.constructor.render({ version })
    } catch (error) {
      if (error instanceof NotFound) {
        throw new NotFound({
          prettyMessage: 'port not found',
        })
      }
      throw error
    }
  }
}
