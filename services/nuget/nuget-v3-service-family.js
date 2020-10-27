'use strict'

const Joi = require('joi')
const RouteBuilder = require('../route-builder')
const { BaseJsonService, NotFound } = require('..')
const {
  renderVersionBadge,
  renderDownloadBadge,
  searchServiceUrl,
  stripBuildMetadata,
  selectVersion,
} = require('./nuget-helpers')

/*
 * Build the Shields service URL object for the given service configuration. Return
 * the RouteBuilder instance to which the service can add the route.
 */
function buildRoute({ serviceBaseUrl, withTenant, withFeed }) {
  let result
  if (withTenant) {
    result = new RouteBuilder().push(`(?:(.+)\\.)?${serviceBaseUrl}`, 'tenant')
  } else {
    result = new RouteBuilder({ base: serviceBaseUrl })
  }
  if (withFeed) {
    result.push('([^/]+)', 'feed')
  }
  return result
}

/*
 * Construct the URL for an individual request.
 *
 * `apiBaseUrl`, `apiDomain`, `withTenant` and `withFeed` come from the service
 * configuration. When `withTenant` and `withFeed` are false, return
 * `apiBaseUrl` for every request.
 *
 * When `withTenant` and/or `withFeed` are true, `tenant` and `feed` come from the
 * request, and this returns a different URL for each request.
 *
 * In practice, `withTenant` and `withFeed` are used together, for MyGet.
 */
function apiUrl({ withTenant, apiBaseUrl, apiDomain, tenant, withFeed, feed }) {
  let result = withTenant
    ? `https://${tenant || 'www'}.${apiDomain}`
    : apiBaseUrl
  if (withFeed) {
    result += `/F/${feed}/api/v3`
  }
  return result
}

const schema = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        versions: Joi.array()
          .items(
            Joi.object({
              version: Joi.string().required(),
            })
          )
          .default([]),
        totalDownloads: Joi.number().integer(),
        totaldownloads: Joi.number().integer(),
      })
    )
    .max(1)
    .default([]),
}).required()

/*
 * Get information about a single package.
 */
async function fetch(
  serviceInstance,
  { baseUrl, packageName, includePrereleases = false }
) {
  const json = await serviceInstance._requestJson({
    schema,
    url: await searchServiceUrl(baseUrl, 'SearchQueryService'),
    options: {
      qs: {
        q: `packageid:${encodeURIComponent(packageName.toLowerCase())}`,
        // Include prerelease versions.
        prerelease: 'true',
        // Include packages with SemVer 2 version numbers.
        semVerLevel: '2',
      },
    },
  })

  if (json.data.length === 1) {
    return json.data[0]
  } else {
    throw new NotFound({ prettyMessage: 'package not found' })
  }
}

/*
 * Create a version and download service for a NuGet v2 API. Return an object
 * containing both services.
 *
 * defaultLabel: The label for the left hand side of the badge.
 * serviceBaseUrl: The base URL for the Shields service, e.g. nuget
 * withTenant: When true, an optional `tenant` is extracted from the badge
 *   URL, which represents the subdomain of the API. When no tenant is
 *   provided, defaults to `www`.
 * apiDomain: When `withTenant` is true, this is the rest of the domain,
 *   e.g. `myget.org`.
 * apiBaseUrl: When `withTenant` is false, this is the base URL of the API,
 *   e.g. https://api.nuget.org/v3
 * withFeed: When true, the badge URL includes a required feed name, which is
 *   added to the request API.
 */
function createServiceFamily({
  defaultLabel,
  serviceBaseUrl,
  withTenant = true,
  apiDomain,
  apiBaseUrl,
  withFeed = true,
}) {
  class NugetVersionService extends BaseJsonService {
    static category = 'version'

    static route = buildRoute({ serviceBaseUrl, withTenant, withFeed })
      .push('(v|vpre)', 'which')
      .push('(.+?)', 'packageName')
      .toObject()

    static examples = []

    static defaultBadgeData = {
      label: defaultLabel,
    }

    static render(props) {
      return renderVersionBadge(props)
    }

    async handle({ tenant, feed, which, packageName }) {
      const includePrereleases = which === 'vpre'
      const baseUrl = apiUrl({
        withTenant,
        apiBaseUrl,
        apiDomain,
        tenant,
        withFeed,
        feed,
      })
      let { versions } = await fetch(this, { baseUrl, packageName })
      versions = versions.map(item => stripBuildMetadata(item.version))
      const version = selectVersion(versions, includePrereleases)
      return this.constructor.render({ version, feed })
    }
  }

  class NugetDownloadService extends BaseJsonService {
    static category = 'downloads'

    static route = buildRoute({ serviceBaseUrl, withTenant, withFeed })
      .push('dt')
      .push('(.+?)', 'packageName')
      .toObject()

    static examples = []

    static render(props) {
      return renderDownloadBadge(props)
    }

    async handle({ tenant, feed, which, packageName }) {
      const baseUrl = apiUrl({
        withTenant,
        apiBaseUrl,
        apiDomain,
        tenant,
        withFeed,
        feed,
      })
      const packageInfo = await fetch(this, { baseUrl, packageName })

      // Official NuGet server uses "totalDownloads" whereas MyGet uses
      // "totaldownloads" (lowercase D). Ugh.
      const downloads =
        packageInfo.totalDownloads || packageInfo.totaldownloads || 0

      return this.constructor.render({ downloads })
    }
  }

  return {
    NugetVersionService,
    NugetDownloadService,
  }
}

module.exports = {
  createServiceFamily,
}
