'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const {
  renderVersionBadge,
  renderDownloadBadge,
  odataToObject,
} = require('./nuget-helpers')
const { BaseJsonService, BaseXmlService, NotFound } = require('..')

function createFilter({ packageName, includePrereleases }) {
  const releaseTypeFilter = includePrereleases
    ? 'IsAbsoluteLatestVersion eq true'
    : 'IsLatestVersion eq true'
  return `Id eq '${packageName}' and ${releaseTypeFilter}`
}

const jsonSchema = Joi.object({
  d: Joi.object({
    results: Joi.array()
      .items(
        Joi.object({
          Version: Joi.string(),
          NormalizedVersion: Joi.string(),
          DownloadCount: nonNegativeInteger,
        })
      )
      .max(1)
      .default([]),
  }).required(),
}).required()

const xmlSchema = Joi.object({
  feed: Joi.object({
    entry: Joi.object({
      'm:properties': Joi.object({
        'd:Version': Joi.alternatives(Joi.string(), Joi.number()),
        'd:NormalizedVersion': Joi.string(),
        'd:DownloadCount': nonNegativeInteger,
        'd:Tags': Joi.string(),
      }),
    }),
  }).required(),
}).required()

async function fetch(
  serviceInstance,
  { odataFormat, baseUrl, packageName, includePrereleases = false }
) {
  const url = `${baseUrl}/Packages()`
  const qs = { $filter: createFilter({ packageName, includePrereleases }) }

  let packageData
  if (odataFormat === 'xml') {
    const data = await serviceInstance._requestXml({
      schema: xmlSchema,
      url,
      options: { qs },
    })
    packageData = odataToObject(data.feed.entry)
  } else if (odataFormat === 'json') {
    const data = await serviceInstance._requestJson({
      schema: jsonSchema,
      url,
      options: {
        headers: { Accept: 'application/atom+json,application/json' },
        qs,
      },
    })
    packageData = data.d.results[0]
  } else {
    throw Error(`Unsupported Atom OData format: ${odataFormat}`)
  }

  if (packageData) {
    return packageData
  } else if (!includePrereleases) {
    return fetch(serviceInstance, {
      odataFormat,
      baseUrl,
      packageName,
      includePrereleases: true,
    })
  } else {
    throw new NotFound()
  }
}

/*
 * Create a version and download service for a NuGet v2 API. Return an object
 * containing both services.
 *
 * defaultLabel: The label for the left hand side of the badge.
 * serviceBaseUrl: The base URL for the Shields service, e.g. chocolatey, resharper
 * apiBaseUrl: The complete base URL of the API, e.g. https://api.example.com/api/v2
 */
function createServiceFamily({
  title,
  name = title,
  defaultLabel,
  serviceBaseUrl,
  apiBaseUrl,
  odataFormat,
  examplePackageName,
  exampleVersion,
  examplePrereleaseVersion,
  exampleDownloadCount,
}) {
  let Base
  if (odataFormat === 'xml') {
    Base = BaseXmlService
  } else if (odataFormat === 'json') {
    Base = BaseJsonService
  } else {
    throw Error(`Unsupported Atom OData format: ${odataFormat}`)
  }

  class NugetVersionService extends Base {
    static get name() {
      return `${name}Version`
    }

    static get category() {
      return 'version'
    }

    static get route() {
      return {
        base: serviceBaseUrl,
        pattern: ':variant(v|vpre)/:packageName',
      }
    }

    static get examples() {
      if (!title) return []

      return [
        {
          title,
          pattern: 'v/:packageName',
          namedParams: { packageName: examplePackageName },
          staticPreview: this.render({ version: exampleVersion }),
        },
        {
          title: `${title} (with prereleases)`,
          pattern: 'vpre/:packageName',
          namedParams: { packageName: examplePackageName },
          staticPreview: this.render({ version: examplePrereleaseVersion }),
        },
      ]
    }

    static get defaultBadgeData() {
      return {
        label: defaultLabel,
      }
    }

    static render(props) {
      return renderVersionBadge(props)
    }

    async handle({ variant, packageName }) {
      const packageData = await fetch(this, {
        odataFormat,
        baseUrl: apiBaseUrl,
        packageName,
        includePrereleases: variant === 'vpre',
      })
      const version = packageData.NormalizedVersion || packageData.Version
      return this.constructor.render({ version })
    }
  }

  class NugetDownloadService extends Base {
    static get name() {
      return `${name}Downloads`
    }

    static get category() {
      return 'downloads'
    }

    static get route() {
      return {
        base: serviceBaseUrl,
        pattern: 'dt/:packageName',
      }
    }

    static get examples() {
      if (!title) return []

      return [
        {
          title,
          namedParams: { packageName: examplePackageName },
          staticPreview: this.render({ downloads: exampleDownloadCount }),
        },
      ]
    }

    static render(props) {
      return renderDownloadBadge(props)
    }

    async handle({ packageName }) {
      const packageData = await fetch(this, {
        odataFormat,
        baseUrl: apiBaseUrl,
        packageName,
      })
      const { DownloadCount: downloads } = packageData
      return this.constructor.render({ downloads })
    }
  }

  return { NugetVersionService, NugetDownloadService }
}

module.exports = {
  createFilter,
  fetch,
  createServiceFamily,
}
