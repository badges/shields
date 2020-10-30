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
    .max(1)
    .default([]),
}).required()

function apiUrl({ organization, repository }) {
  return `https://f.feedz.io/${organization}/${repository}/nuget`
}

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

  async fetch({ baseUrl, packageName }) {
    const registrationsBaseUrl = await searchServiceUrl(
      baseUrl,
      'RegistrationsBaseUrl'
    )
    const json = await this._requestJson({
      schema,
      url: `${registrationsBaseUrl}${packageName}/index.json`,
    })

    if (json.items.length === 1) {
      return json.items[0].items.map(i =>
        stripBuildMetadata(i.catalogEntry.version)
      )
    } else {
      throw new NotFound({ prettyMessage: 'not found' })
    }
  }

  async handle({ which, organization, repository, packageName }) {
    const includePrereleases = which === 'vpre'
    const baseUrl = apiUrl({ organization, repository })

    const allVersions = await this.fetch({ baseUrl, packageName })
    const version = selectVersion(allVersions, includePrereleases)
    return this.constructor.render({
      version,
      feed: FeedzVersionService.defaultBadgeData.label,
    })
  }
}

module.exports = {
  FeedzVersionService,
}
