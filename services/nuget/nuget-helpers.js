import semver from 'semver'
import { metric, addv } from '../text-formatters.js'
import { downloadCount as downloadCountColor } from '../color-formatters.js'
import { getCachedResource } from '../../core/base-service/resource-cache.js'

function renderVersionBadge({ version, feed }) {
  let color
  if (version.includes('-')) {
    color = 'yellow'
  } else if (version.startsWith('0')) {
    color = 'orange'
  } else {
    color = 'blue'
  }

  return {
    message: addv(version),
    color,
    label: feed,
  }
}

function renderDownloadBadge({ downloads }) {
  return {
    message: metric(downloads),
    color: downloadCountColor(downloads),
  }
}

function odataToObject(odata) {
  if (odata === undefined) {
    return undefined
  }

  const result = {}
  Object.entries(odata['m:properties']).forEach(([key, value]) => {
    const newKey = key.replace(/^d:/, '')
    result[newKey] = value
  })
  return result
}

function randomElementFrom(items) {
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

/*
 * Hit the service index endpoint and return a {serviceType} URL, chosen
 * at random. Cache the responses, but return a different random URL each time.
 */
async function searchServiceUrl(baseUrl, serviceType = 'SearchQueryService') {
  // Should we really be caching all these NuGet feeds in memory?
  const searchQueryServices = await getCachedResource({
    url: `${baseUrl}/index.json`,
    // The endpoint changes once per year (ie, a period of n = 1 year).
    // We minimize the users' waiting time for information.
    // With l = latency to fetch the endpoint and x = endpoint update period
    // both in years, the yearly number of queries for the endpoint are 1/x,
    // and when the endpoint changes, we wait for up to x years to get the
    // right endpoint.
    // So the waiting time within n years is n*l/x + x years, for which a
    // derivation yields an optimum at x = sqrt(n*l), roughly 42 minutes.
    ttl: 42 * 60 * 1000,
    scraper: json =>
      json.resources.filter(resource => resource['@type'] === serviceType),
  })
  return randomElementFrom(searchQueryServices)['@id']
}

/*
 * Strip Build MetaData
 * Nuget versions may include an optional "build metadata" clause,
 * separated from the version by a + character.
 */
function stripBuildMetadata(version) {
  return version.split('+')[0]
}

/*
 * Select latest version from NuGet feed, filtering-out prerelease versions if needed
 */
function selectVersion(versions, includePrereleases) {
  if (includePrereleases) {
    return versions.slice(-1).pop()
  } else {
    const filtered = versions.filter(i => {
      if (semver.valid(i)) {
        return !semver.prerelease(i)
      } else {
        return !i.includes('-')
      }
    })
    if (filtered.length > 0) {
      return filtered.slice(-1).pop()
    } else {
      return versions.slice(-1).pop()
    }
  }
}

export {
  renderVersionBadge,
  renderDownloadBadge,
  odataToObject,
  searchServiceUrl,
  stripBuildMetadata,
  selectVersion,
}
