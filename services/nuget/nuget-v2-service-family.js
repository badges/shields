'use strict'

const Joi = require('joi')

const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')
const { renderVersionBadge, renderDownloadBadge } = require('./nuget-helpers')

async function fetch(
  serviceInstance,
  { baseUrl, repo, includePrereleases = false }
) {
  const releaseTypeFilter = includePrereleases
    ? 'IsAbsoluteLatestVersion eq true'
    : 'IsLatestVersion eq true'
  const filter = `Id eq '${repo}' and ${releaseTypeFilter}`
  const data = await serviceInstance._requestJson({
    schema: Joi.any(),
    url: `${baseUrl}/Packages()`,
    options: {
      headers: { Accept: 'application/atom+json,application/json' },
      qs: { $filter: filter },
    },
  })

  const packageData = data.d.results[0]

  if (packageData) {
    return packageData
  } else if (!includePrereleases) {
    return fetch(serviceInstance, { baseUrl, repo, includePrereleases: true })
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
function createServiceFamily({ defaultLabel, serviceBaseUrl, apiBaseUrl }) {
  class NugetVersionService extends BaseJsonService {
    static get category() {
      return 'version'
    }

    static get url() {
      return {
        base: serviceBaseUrl,
        pattern: ':which(v|vpre)/:repo',
      }
    }

    static get examples() {
      return []
    }

    static get defaultBadgeData() {
      return {
        label: defaultLabel,
      }
    }

    static render(props) {
      return renderVersionBadge(props)
    }

    async handle({ which, repo }) {
      const packageData = await fetch(this, {
        baseUrl: apiBaseUrl,
        repo,
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

    static get url() {
      return {
        base: serviceBaseUrl,
        format: 'dt/(.*)',
        capture: ['repo'],
      }
    }

    static get examples() {
      return []
    }

    static render(props) {
      return renderDownloadBadge(props)
    }

    async handle({ repo }) {
      const packageData = await fetch(this, {
        baseUrl: apiBaseUrl,
        repo,
      })
      const { DownloadCount: downloads } = packageData
      return this.constructor.render({ downloads })
    }
  }

  return { NugetVersionService, NugetDownloadService }
}

module.exports = {
  createServiceFamily,
}
