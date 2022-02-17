import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import { optionalUrl } from '../validators.js'
import { NotFound } from '../index.js'
import {
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
} from './packagist-base.js'

const packageSchema = Joi.array()
  .items(
    Joi.object({
      version: Joi.string(),
      license: Joi.array(),
    }).required()
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

  static examples = [
    {
      title: 'Packagist License',
      namedParams: { user: 'doctrine', repo: 'orm' },
      staticPreview: renderLicenseBadge({ license: 'MIT' }),
      keywords,
    },
    {
      title: 'Packagist License (custom server)',
      namedParams: { user: 'doctrine', repo: 'orm' },
      queryParams: { server: 'https://packagist.org' },
      staticPreview: renderLicenseBadge({ license: 'MIT' }),
      keywords,
      documentation: customServerDocumentationFragment,
    },
  ]

  static defaultBadgeData = {
    label: 'license',
  }

  /**
   * Get the license from the latest release package version.
   *
   * @param {object} attrs An object of attributes from the request.
   * @param {object[]} attrs.versions An array of package version objects.
   *
   * @returns {object} An object with a "license" attribute string of the latest release version.
   *
   * @throws {NotFound} If a release version is not found, or the license is not found.
   */
  getLicense({ versions }) {
    const version = this.findLatestRelease(versions)
    const license = version.license
    if (!license) {
      throw new NotFound({ prettyMessage: 'license not found' })
    }

    return { license }
  }

  async handle({ user, repo }, { server }) {
    const json = await this.fetch({ user, repo, schema, server })
    const versions = BasePackagistService.expandPackageVersions(
      json,
      this.getPackageName(user, repo)
    )
    const license = this.getLicense({ versions, user, repo })

    return renderLicenseBadge({ license })
  }
}
