'use strict'

const Joi = require('joi')
const RouteBuilder = require('../route-builder')
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

  static route = new RouteBuilder({ base: 'feedz' })
    .push('(v|vpre)', 'which')
    .push('([^/]+)', 'organization')
    .push('([^/]+)', 'repository')
    .push('(.+?)', 'packageName')
    .toObject()

  static examples = [
    {
      title: 'Feedz',
      pattern: ':tenant/:feed/v/:packageName',
      namedParams: {
        tenant: 'leancode',
        feed: 'mongodb',
        packageName: 'MongoDB.Driver.Core',
      },
      staticPreview: this.render({ version: '2.6.1' }),
    },
    {
      title: 'Feedz (with prereleases)',
      pattern: ':tenant/:feed/vpre/:packageName',
      namedParams: {
        tenant: 'leancode',
        feed: 'mongodb',
        packageName: 'MongoDB.Driver.Core',
      },
      staticPreview: this.render({ version: '2.7.0-beta0001' }),
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
