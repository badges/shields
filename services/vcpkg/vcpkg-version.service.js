import Joi from 'joi'
import { ConditionalGithubAuthV3Service } from '../github/github-auth-service.js'
import { fetchJsonFromRepo } from '../github/github-common-fetch.js'
import { renderVersionBadge } from '../version.js'
import { NotFound } from '../index.js'

// Handle the different version fields available in Vcpkg manifests
// https://learn.microsoft.com/en-us/vcpkg/reference/vcpkg-json?source=recommendations#version
const vcpkgManifestSchema = Joi.alternatives()
  .match('one')
  .try(
    Joi.object({
      version: Joi.string().required(),
    }).required(),
    Joi.object({
      'version-date': Joi.string().required(),
    }).required(),
    Joi.object({
      'version-semver': Joi.string().required(),
    }).required(),
    Joi.object({
      'version-string': Joi.string().required(),
    }).required()
  )

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
      const payload = await fetchJsonFromRepo(this, {
        schema: vcpkgManifestSchema,
        user: 'microsoft',
        repo: 'vcpkg',
        branch: 'master',
        filename: `ports/${portName}/vcpkg.json`,
      })
      if (payload['version-date']) {
        return this.constructor.render({ version: payload['version-date'] })
      }
      if (payload['version-semver']) {
        return this.constructor.render({ version: payload['version-semver'] })
      }
      if (payload['version-string']) {
        return this.constructor.render({ version: payload['version-string'] })
      }
      return this.constructor.render({ version: payload.version })
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
