import Joi from 'joi'
import { ConditionalGithubAuthV3Service } from '../github/github-auth-service.js'
import { fetchJsonFromRepo } from '../github/github-common-fetch.js'
import { renderVersionBadge } from '../version.js'
import { NotFound, pathParams } from '../index.js'
import { parseVersionFromVcpkgManifest } from './vcpkg-version-helpers.js'

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
    }).required(),
  )

export default class VcpkgVersion extends ConditionalGithubAuthV3Service {
  static category = 'version'

  static route = { base: 'vcpkg/v', pattern: ':portName' }

  static openApi = {
    '/vcpkg/v/{portName}': {
      get: {
        summary: 'Vcpkg Version',
        parameters: pathParams({
          name: 'portName',
          example: 'entt',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'vcpkg' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ portName }) {
    try {
      const manifest = await fetchJsonFromRepo(this, {
        schema: vcpkgManifestSchema,
        user: 'microsoft',
        repo: 'vcpkg',
        branch: 'master',
        filename: `ports/${portName}/vcpkg.json`,
      })
      const version = parseVersionFromVcpkgManifest(manifest)
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
