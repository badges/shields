import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import { optionalUrl } from '../validators.js'
import { NotFound, pathParam, queryParam } from '../index.js'
import {
  BasePackagistService,
  customServerDocumentationFragment,
  description,
} from './packagist-base.js'

const packageSchema = Joi.array()
  .items(
    Joi.object({
      version: Joi.string(),
      license: Joi.array(),
    }).required(),
  )
  .required()

const schema = Joi.object({
  packages: Joi.object().pattern(/^/, packageSchema).required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

export default class PackagistLicense extends BasePackagistService {
  static category = 'license'

  static route = {
    base: 'packagist/l',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/packagist/l/{user}/{repo}': {
      get: {
        summary: 'Packagist License',
        description,
        parameters: [
          pathParam({
            name: 'user',
            example: 'guzzlehttp',
          }),
          pathParam({
            name: 'repo',
            example: 'guzzle',
          }),
          queryParam({
            name: 'server',
            description: customServerDocumentationFragment,
            example: 'https://packagist.org',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'license',
  }

  transform({ json, user, repo }) {
    const packageName = this.getPackageName(user, repo)

    const versions = BasePackagistService.expandPackageVersions(
      json,
      packageName,
    )

    const version = this.findLatestRelease(versions)
    const license = version.license
    if (!license) {
      throw new NotFound({ prettyMessage: 'license not found' })
    }

    return { license }
  }

  async handle({ user, repo }, { server }) {
    const json = await this.fetch({ user, repo, schema, server })

    const { license } = this.transform({ json, user, repo })

    return renderLicenseBadge({ license })
  }
}
