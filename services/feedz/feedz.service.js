import Joi from 'joi'
import { BaseJsonService, NotFound, pathParams } from '../index.js'
import { stripBuildMetadata, selectVersion } from '../nuget/nuget-helpers.js'
import { renderVersionBadge } from '../version.js'

const packagesSchema = Joi.object({
  versions: Joi.array().items(Joi.string()).required(),
}).required()

class FeedzVersionService extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'feedz',
    pattern: ':variant(v|vpre)/:organization/:repository/:packageName',
  }

  static openApi = {
    '/feedz/{variant}/{organization}/{repository}/{packageName}': {
      get: {
        summary: 'Feedz Version',
        parameters: pathParams(
          {
            name: 'variant',
            example: 'v',
            description: 'version or version including pre-releases',
            schema: { type: 'string', enum: this.getEnum('variant') },
          },
          {
            name: 'organization',
            example: 'shieldstests',
          },
          {
            name: 'repository',
            example: 'mongodb',
          },
          {
            name: 'packageName',
            example: 'MongoDB.Driver.Core',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'feedz',
  }

  packagesUrl({ organization, repository, packageName }) {
    return `https://f.feedz.io/${organization}/${repository}/nuget/v3/packages/${packageName}/index.json`
  }

  transform({ versions, includePrereleases }) {
    if (versions.length === 0) {
      throw new NotFound({ prettyMessage: 'package not found' })
    }
    // Strip build metadata and select the appropriate version
    const cleanedVersions = versions.map(v => stripBuildMetadata(v))
    return selectVersion(cleanedVersions, includePrereleases)
  }

  async handle({ variant, organization, repository, packageName }) {
    const includePrereleases = variant === 'vpre'
    const url = this.packagesUrl({ organization, repository, packageName })
    const json = await this._requestJson({
      schema: packagesSchema,
      url,
      httpErrors: {
        404: 'repository or package not found',
      },
    })
    const version = this.transform({
      versions: json.versions,
      includePrereleases,
    })
    return renderVersionBadge({
      version,
      defaultLabel: FeedzVersionService.defaultBadgeData.label,
    })
  }
}

export { FeedzVersionService }
