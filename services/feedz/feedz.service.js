import Joi from 'joi'
import { BaseJsonService, NotFound } from '../index.js'
import {
  renderVersionBadge,
  searchServiceUrl,
  stripBuildMetadata,
  selectVersion,
} from '../nuget/nuget-helpers.js'

const singlePageSchema = Joi.object({
  '@id': Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        catalogEntry: Joi.object({
          version: Joi.string().required(),
        }).required(),
      })
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
    pattern: ':which(v|vpre)/:organization/:repository/:packageName',
  }

  static examples = [
    {
      title: 'Feedz',
      pattern: 'v/:organization/:repository/:packageName',
      namedParams: {
        organization: 'shieldstests',
        repository: 'mongodb',
        packageName: 'MongoDB.Driver.Core',
      },
      staticPreview: this.render({ version: '2.10.4' }),
    },
    {
      title: 'Feedz (with prereleases)',
      pattern: 'vpre/:organization/:repository/:packageName',
      namedParams: {
        organization: 'shieldstests',
        repository: 'mongodb',
        packageName: 'MongoDB.Driver.Core',
      },
      staticPreview: this.render({ version: '2.11.0-beta2' }),
    },
  ]

  static defaultBadgeData = {
    label: 'feedz',
  }

  static render(props) {
    return renderVersionBadge(props)
  }

  apiUrl({ organization, repository }) {
    return `https://f.feedz.io/${organization}/${repository}/nuget`
  }

  async fetch({ baseUrl, packageName }) {
    const registrationsBaseUrl = await searchServiceUrl(
      baseUrl,
      'RegistrationsBaseUrl'
    )
    return await this._requestJson({
      schema: packageSchema,
      url: `${registrationsBaseUrl}${packageName}/index.json`,
      errorMessages: {
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
            errorMessages: {
              404: 'repository or package not found',
            },
          })
        )
      )
      return { items }
    }
  }

  transform({ json, includePrereleases }) {
    const versions = json.items.flatMap(tl =>
      tl.items.map(i => stripBuildMetadata(i.catalogEntry.version))
    )
    if (versions.length >= 1) {
      return selectVersion(versions, includePrereleases)
    } else {
      throw new NotFound({ prettyMessage: 'package not found' })
    }
  }

  async handle({ which, organization, repository, packageName }) {
    const includePrereleases = which === 'vpre'
    const baseUrl = this.apiUrl({ organization, repository })
    const json = await this.fetch({ baseUrl, packageName })
    const fetchedJson = await this.fetchItems({ json })
    const version = this.transform({ json: fetchedJson, includePrereleases })
    return this.constructor.render({
      version,
      feed: FeedzVersionService.defaultBadgeData.label,
    })
  }
}

export { FeedzVersionService }
