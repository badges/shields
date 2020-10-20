'use strict'

const { promisify } = require('util')
const Joi = require('joi')
const semver = require('semver')
const { regularUpdate } = require('../../core/legacy/regular-update')
const RouteBuilder = require('../route-builder')
const { BaseJsonService, NotFound } = require('..')
const { renderVersionBadge } = require('../nuget/nuget-helpers')

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

function apiUrl({ tenant, feed }) {
  return `https://f.feedz.io/${tenant}/${feed}/nuget`
}

/*
 * Hit the service index endpoint and return a first RegistrationsBaseUrl URL.
 */
function searchQueryServiceUrl(baseUrl) {
  return promisify(regularUpdate)({
    url: `${baseUrl}/index.json`,
    intervalMillis: 42 * 60 * 1000,
    json: true,
    scraper: json =>
      json.resources.filter(r => r['@type'] === 'RegistrationsBaseUrl')[0][
        '@id'
      ],
  })
}

/*
 * Strip Build MetaData
 * Nuget versions may include an optional "build metadata" clause,
 * separated from the version by a + character.
 */
function stripBuildMetadata(version) {
  return version.split('+')[0]
}

async function fetch(serviceInstance, { baseUrl, packageName }) {
  const registrationsBaseUrl = await searchQueryServiceUrl(baseUrl)
  const json = await serviceInstance._requestJson({
    schema,
    url: `${registrationsBaseUrl}${packageName}/index.json`,
  })

  if (json.items.length === 1) {
    return json.items[0].items.map(i =>
      stripBuildMetadata(i.catalogEntry.version)
    )
  } else {
    throw new NotFound({ prettyMessage: 'package not found' })
  }
}

function selectVersion(versions, includePrereleases) {
  if (includePrereleases) {
    return versions.slice(-1).pop()
  } else {
    const filtered = versions.filter(i => {
      if (semver.valid(i)) {
        return !semver.prerelease(i)
      } else {
        return !i.version.includes('-')
      }
    })
    if (filtered.length > 0) {
      return filtered.slice(-1).pop()
    } else {
      return versions.slice(-1).pop()
    }
  }
}

class FeedzVersionService extends BaseJsonService {
  static category = 'version'

  static route = new RouteBuilder({ base: 'feedz' })
    .push('([^/]+)', 'tenant')
    .push('([^/]+)', 'feed')
    .push('(v|vpre)', 'which')
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

  async handle({ tenant, feed, which, packageName }) {
    const includePrereleases = which === 'vpre'
    const baseUrl = apiUrl({ tenant, feed })

    const allVersions = await fetch(this, { baseUrl, packageName })
    const version = selectVersion(allVersions, includePrereleases)
    return this.constructor.render({ version, feed })
  }
}

module.exports = {
  FeedzVersionService,
}
