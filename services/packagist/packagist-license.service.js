import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import { optionalUrl } from '../validators.js'
import { NotFound } from '../index.js'
import {
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
  messageLicenseNotFound,
} from './packagist-base.js'

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
   * @returns {string[]} An array of "license" attribute string of the latest release version.
   *
   * @throws {NotFound} If a release version is not found, or the license is not found.
   */
  getLicenses({ versions }) {
    const { license: licenses } = this.constructor.findVersion(versions, {
      includeDefaultBranch: true,
    })
    return { licenses }
  }

  async handle({ user, repo }, { server }) {
    try {
      const versions = await this.fetchRelease({ user, repo, server })
      const { licenses } = this.getLicenses({ versions, user, repo })
      return renderLicenseBadge({ licenses })
    } catch (e) {
      if (e instanceof NotFound && e.prettyMessage === messageLicenseNotFound) {
        const versions = await this.fetchDev({ user, repo, server })
        const { licenses } = this.getLicenses({ versions, user, repo })
        return renderLicenseBadge({ licenses })
      }
      throw e // re-throw
    }
  }
}
