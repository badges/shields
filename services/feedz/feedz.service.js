'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')
const {
  renderVersionBadge,
  searchServiceUrl,
  stripBuildMetadata,
  selectVersion,
} = require('../nuget/nuget-helpers')

const schema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        items: Joi.array().items(
          Joi.object({
            catalogEntry: Joi.object({
              version: Joi.string().required(),
            }).required(),
          })
        ),
      }).required()
    )
    .default([]),
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
      schema,
      url: `${registrationsBaseUrl}${packageName}/index.json`,
      errorMessages: {
        404: 'repository or package not found',
      },
    })
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
    const version = this.transform({ json, includePrereleases })
    return this.constructor.render({
      version,
      feed: FeedzVersionService.defaultBadgeData.label,
    })
  }
}

module.exports = {
  FeedzVersionService,
}
