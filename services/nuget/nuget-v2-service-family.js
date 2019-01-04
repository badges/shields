'use strict'

const Joi = require('joi')

const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')
const { nonNegativeInteger } = require('../validators')
const { renderVersionBadge, renderDownloadBadge } = require('./nuget-helpers')

function createFilter({ packageName, includePrereleases }) {
  const releaseTypeFilter = includePrereleases
    ? 'IsAbsoluteLatestVersion eq true'
    : 'IsLatestVersion eq true'
  return `Id eq '${packageName}' and ${releaseTypeFilter}`
}

const schema = Joi.object({
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

async function fetch(
  serviceInstance,
  { baseUrl, packageName, includePrereleases = false }
) {
  const data = await serviceInstance._requestJson({
    schema,
    url: `${baseUrl}/Packages()`,
    options: {
      headers: { Accept: 'application/atom+json,application/json' },
      qs: { $filter: createFilter({ packageName, includePrereleases }) },
    },
  })

  const packageData = data.d.results[0]

  if (packageData) {
    return packageData
  } else if (!includePrereleases) {
    return fetch(serviceInstance, {
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
  defaultLabel,
  serviceBaseUrl,
  apiBaseUrl,
  title,
  examplePackageName,
  exampleVersion,
  examplePrereleaseVersion,
  exampleDownloadCount,
}) {
  class NugetVersionService extends BaseJsonService {
    static get category() {
      return 'version'
    }

    static get route() {
      return {
        base: serviceBaseUrl,
        pattern: ':which(v|vpre)/:packageName',
      }
    }

    static get examples() {
      if (!title) return []

      return [
        {
          title,
          pattern: 'v/:packageName',
          namedParams: { which: 'v', packageName: examplePackageName },
          staticExample: this.render({ version: exampleVersion }),
        },
        {
          title: `${title} (with prereleases)`,
          pattern: 'vpre/:packageName',
          namedParams: { which: 'vpre', packageName: examplePackageName },
          staticExample: this.render({ version: examplePrereleaseVersion }),
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

    async handle({ which, packageName }) {
      const packageData = await fetch(this, {
        baseUrl: apiBaseUrl,
        packageName,
        includePrereleases: which === 'vpre',
      })
      const version = packageData.NormalizedVersion || packageData.Version
      return this.constructor.render({ version })
    }
  }

  class NugetDownloadService extends BaseJsonService {
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
          staticExample: this.render({ downloads: exampleDownloadCount }),
        },
      ]
    }

    static render(props) {
      return renderDownloadBadge(props)
    }

    async handle({ packageName }) {
      const packageData = await fetch(this, {
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
  createServiceFamily,
}
