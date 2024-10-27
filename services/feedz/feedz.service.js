import Joi from 'joi'
import { BaseJsonService, NotFound, pathParams } from '../index.js'
import {
  searchServiceUrl,
  stripBuildMetadata,
  selectVersion,
} from '../nuget/nuget-helpers.js'
import { renderVersionBadge } from '../version.js'

const singlePageSchema = Joi.object({
  '@id': Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        catalogEntry: Joi.object({
          version: Joi.string().required(),
        }).required(),
      }),
    )
    .default([]),
}).required()

const packageSchema = Joi.object({
  items: Joi.array().items(singlePageSchema).default([]),
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

  apiUrl({ organization, repository }) {
    return `https://f.feedz.io/${organization}/${repository}/nuget`
  }

  async fetch({ baseUrl, packageName }) {
    const registrationsBaseUrl = await searchServiceUrl(
      baseUrl,
      'RegistrationsBaseUrl',
    )
    return await this._requestJson({
      schema: packageSchema,
      url: `${registrationsBaseUrl}${packageName}/index.json`,
      httpErrors: {
        404: 'repository or package not found',
      },
    })
  }

  async fetchItems({ json }) {
    if (json.items.length === 0 || json.items.some(i => i.catalogEntry)) {
      return json
    } else {
      const items = await Promise.all(
        json.items.map(i =>
          this._requestJson({
            schema: singlePageSchema,
            url: i['@id'],
            httpErrors: {
              404: 'repository or package not found',
            },
          }),
        ),
      )
      return { items }
    }
  }

  transform({ json, includePrereleases }) {
    const versions = json.items.flatMap(tl =>
      tl.items.map(i => stripBuildMetadata(i.catalogEntry.version)),
    )
    if (versions.length >= 1) {
      return selectVersion(versions, includePrereleases)
    } else {
      throw new NotFound({ prettyMessage: 'package not found' })
    }
  }

  async handle({ variant, organization, repository, packageName }) {
    const includePrereleases = variant === 'vpre'
    const baseUrl = this.apiUrl({ organization, repository })
    const json = await this.fetch({ baseUrl, packageName })
    const fetchedJson = await this.fetchItems({ json })
    const version = this.transform({ json: fetchedJson, includePrereleases })
    return renderVersionBadge({
      version,
      defaultLabel: FeedzVersionService.defaultBadgeData.label,
    })
  }
}

export { FeedzVersionService }
