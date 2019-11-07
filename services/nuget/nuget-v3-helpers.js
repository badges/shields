'use strict'

const { promisify } = require('util')
const Joi = require('@hapi/joi')
const semver = require('semver')
const { regularUpdate } = require('../../core/legacy/regular-update')
const { NotFound } = require('..')

function randomElementFrom(items) {
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

/*
 * Hit the service index endpoint and return a SearchQueryService URL, chosen
 * at random. Cache the responses, but return a different random URL each time.
 */
async function searchQueryServiceUrl(baseUrl) {
  // Should we really be caching all these NuGet feeds in memory?
  const searchQueryServices = await promisify(regularUpdate)({
    url: `${baseUrl}/index.json`,
    // The endpoint changes once per year (ie, a period of n = 1 year).
    // We minimize the users' waiting time for information.
    // With l = latency to fetch the endpoint and x = endpoint update period
    // both in years, the yearly number of queries for the endpoint are 1/x,
    // and when the endpoint changes, we wait for up to x years to get the
    // right endpoint.
    // So the waiting time within n years is n*l/x + x years, for which a
    // derivation yields an optimum at x = sqrt(n*l), roughly 42 minutes.
    intervalMillis: 42 * 60 * 1000,
    json: true,
    scraper: json =>
      json.resources.filter(
        resource => resource['@type'] === 'SearchQueryService/3.0.0-beta'
      ),
  })
  return randomElementFrom(searchQueryServices)['@id']
}

const schema = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
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
    // .max(1)
    .default([]),
}).required()

/*
 * Get information about a single package.
 */
async function fetchPackage(
  serviceInstance,
  { baseUrl, packageName, includePrereleases = false }
) {
  const url = await searchQueryServiceUrl(baseUrl)
  const json = await serviceInstance._requestJson({
    schema,
    url,
    options: {
      qs: {
        q: `${encodeURIComponent(packageName.toLowerCase())}`,
        // Include prerelease versions.
        prerelease: 'true',
        // Include packages with SemVer 2 version numbers.
        semVerLevel: '2',
      },
    },
  })

  for (const d of json.data) {
    if (
      packageName.localeCompare(d.id, undefined, { sensitivity: 'base' }) === 0
    ) {
      return d
    }
  }

  throw new NotFound({ prettyMessage: 'package not found' })
}

function getLatestVersion(versions, includePrereleases = false) {
  if (!includePrereleases) {
    versions = versions.filter(item => !item.version.includes('-'))
  }

  versions.sort((a, b) => semver.rcompare(a.version, b.version))
  return versions[0]
}

module.exports = {
  fetchPackage,
  getLatestVersion,
}
