'use strict'

const { downloadCount: downloadCountColor } = require('./color-formatters')
const { makeBadgeData: getBadgeData } = require('./badge-data')
const { metric } = require('./text-formatters')
const { regularUpdate } = require('./regular-update')

function mapNugetFeedv2({ camp, cache }, pattern, offset, getInfo) {
  const vRegex = new RegExp(
    '^\\/' + pattern + '\\/v\\/(.*)\\.(svg|png|gif|jpg|json)$'
  )
  const vPreRegex = new RegExp(
    '^\\/' + pattern + '\\/vpre\\/(.*)\\.(svg|png|gif|jpg|json)$'
  )
  const dtRegex = new RegExp(
    '^\\/' + pattern + '\\/dt\\/(.*)\\.(svg|png|gif|jpg|json)$'
  )

  function getNugetPackage(apiUrl, id, includePre, request, done) {
    const filter = includePre
      ? "Id eq '" + id + "' and IsAbsoluteLatestVersion eq true"
      : "Id eq '" + id + "' and IsLatestVersion eq true"
    const reqUrl = apiUrl + '/Packages()?$filter=' + encodeURIComponent(filter)
    request(
      reqUrl,
      { headers: { Accept: 'application/atom+json,application/json' } },
      function(err, res, buffer) {
        if (err != null) {
          done(new Error('inaccessible'))
          return
        }

        try {
          const data = JSON.parse(buffer)
          const result = data.d.results[0]
          if (result == null) {
            if (includePre === null) {
              getNugetPackage(apiUrl, id, true, request, done)
            } else {
              done(new Error('not found'))
            }
          } else {
            done(null, result)
          }
        } catch (e) {
          done(new Error('invalid'))
        }
      }
    )
  }

  camp.route(
    vRegex,
    cache(function(data, match, sendBadge, request) {
      const info = getInfo(match)
      const site = info.site // eg, `Chocolatey`, or `YoloDev`
      const repo = match[offset + 1] // eg, `Nuget.Core`.
      const format = match[offset + 2]
      const apiUrl = info.feed
      const badgeData = getBadgeData(site, data)
      getNugetPackage(apiUrl, repo, null, request, function(err, data) {
        if (err != null) {
          badgeData.text[1] = err.message
          sendBadge(format, badgeData)
          return
        }
        const version = data.NormalizedVersion || data.Version
        badgeData.text[1] = 'v' + version
        if (version.indexOf('-') !== -1) {
          badgeData.colorscheme = 'yellow'
        } else if (version[0] === '0') {
          badgeData.colorscheme = 'orange'
        } else {
          badgeData.colorscheme = 'blue'
        }
        sendBadge(format, badgeData)
      })
    })
  )

  camp.route(
    vPreRegex,
    cache(function(data, match, sendBadge, request) {
      const info = getInfo(match)
      const site = info.site // eg, `Chocolatey`, or `YoloDev`
      const repo = match[offset + 1] // eg, `Nuget.Core`.
      const format = match[offset + 2]
      const apiUrl = info.feed
      const badgeData = getBadgeData(site, data)
      getNugetPackage(apiUrl, repo, true, request, function(err, data) {
        if (err != null) {
          badgeData.text[1] = err.message
          sendBadge(format, badgeData)
          return
        }
        const version = data.NormalizedVersion || data.Version
        badgeData.text[1] = 'v' + version
        if (version.indexOf('-') !== -1) {
          badgeData.colorscheme = 'yellow'
        } else if (version[0] === '0') {
          badgeData.colorscheme = 'orange'
        } else {
          badgeData.colorscheme = 'blue'
        }
        sendBadge(format, badgeData)
      })
    })
  )

  camp.route(
    dtRegex,
    cache(function(data, match, sendBadge, request) {
      const info = getInfo(match)
      const repo = match[offset + 1] // eg, `Nuget.Core`.
      const format = match[offset + 2]
      const apiUrl = info.feed
      const badgeData = getBadgeData('downloads', data)
      getNugetPackage(apiUrl, repo, null, request, function(err, data) {
        if (err != null) {
          badgeData.text[1] = err.message
          sendBadge(format, badgeData)
          return
        }
        const downloads = data.DownloadCount
        badgeData.text[1] = metric(downloads)
        badgeData.colorscheme = downloadCountColor(downloads)
        sendBadge(format, badgeData)
      })
    })
  )
}

function mapNugetFeed({ camp, cache }, pattern, offset, getInfo) {
  const vRegex = new RegExp(
    '^\\/' + pattern + '\\/v\\/(.*)\\.(svg|png|gif|jpg|json)$'
  )
  const vPreRegex = new RegExp(
    '^\\/' + pattern + '\\/vpre\\/(.*)\\.(svg|png|gif|jpg|json)$'
  )
  const dtRegex = new RegExp(
    '^\\/' + pattern + '\\/dt\\/(.*)\\.(svg|png|gif|jpg|json)$'
  )

  function getNugetData(apiUrl, id, request, done) {
    // get service index document

    regularUpdate(
      {
        url: apiUrl + '/index.json',
        // The endpoint changes once per year (ie, a period of n = 1 year).
        // We minimize the users' waiting time for information.
        // With l = latency to fetch the endpoint and x = endpoint update period
        // both in years, the yearly number of queries for the endpoint are 1/x,
        // and when the endpoint changes, we wait for up to x years to get the
        // right endpoint.
        // So the waiting time within n years is n*l/x + x years, for which a
        // derivation yields an optimum at x = sqrt(n*l), roughly 42 minutes.
        intervalMillis: 42 * 60 * 1000,
        json: false,
        scraper: function(data) {
          return data
        },
      },
      (err, buf) => {
        if (err != null) {
          done(new Error('inaccessible'))
          return
        }

        try {
          const searchQueryResources = JSON.parse(buf).resources.filter(
            resource => resource['@type'] === 'SearchQueryService'
          )
          // query autocomplete service
          const randomEndpointIdx = Math.floor(
            Math.random() * searchQueryResources.length
          )
          const reqUrl =
            searchQueryResources[randomEndpointIdx]['@id'] +
            '?q=packageid:' +
            encodeURIComponent(id.toLowerCase()) + // NuGet package id (lowercase)
            '&prerelease=true' // Include prerelease versions?

          request(reqUrl, (err, res, buffer) => {
            if (err != null) {
              done(new Error('inaccessible'))
              return
            }

            try {
              const data = JSON.parse(buffer)
              if (!Array.isArray(data.data) || data.data.length !== 1) {
                done(new Error('not found'))
                return
              }
              done(null, data.data[0])
            } catch (e) {
              done(new Error('invalid'))
            }
          })
        } catch (e) {
          done(new Error('invalid'))
        }
      }
    )
  }

  function getNugetVersion(apiUrl, id, includePre, request, done) {
    getNugetData(apiUrl, id, request, function(err, data) {
      if (err) {
        done(err)
        return
      }
      let versions = data.versions || []
      if (!includePre) {
        // Remove prerelease versions.
        const filteredVersions = versions.filter(function(version) {
          return !/-/.test(version.version)
        })
        if (filteredVersions.length > 0) {
          versions = filteredVersions
        }
      }
      const lastVersion = versions[versions.length - 1]
      done(null, lastVersion.version)
    })
  }

  camp.route(
    vRegex,
    cache(function(data, match, sendBadge, request) {
      const info = getInfo(match)
      const site = info.site // eg, `Chocolatey`, or `YoloDev`
      const repo = match[offset + 1] // eg, `Nuget.Core`.
      const format = match[offset + 2]
      const apiUrl = info.feed
      const badgeData = getBadgeData(site, data)
      getNugetVersion(apiUrl, repo, false, request, function(err, version) {
        if (err != null) {
          badgeData.text[1] = err.message
          sendBadge(format, badgeData)
          return
        }
        try {
          badgeData.text[1] = 'v' + version
          if (version.indexOf('-') !== -1) {
            badgeData.colorscheme = 'yellow'
          } else if (version[0] === '0') {
            badgeData.colorscheme = 'orange'
          } else {
            badgeData.colorscheme = 'blue'
          }
          sendBadge(format, badgeData)
        } catch (e) {
          badgeData.text[1] = 'invalid'
          sendBadge(format, badgeData)
        }
      })
    })
  )

  camp.route(
    vPreRegex,
    cache(function(data, match, sendBadge, request) {
      const info = getInfo(match)
      const site = info.site // eg, `Chocolatey`, or `YoloDev`
      const repo = match[offset + 1] // eg, `Nuget.Core`.
      const format = match[offset + 2]
      const apiUrl = info.feed
      const badgeData = getBadgeData(site, data)
      getNugetVersion(apiUrl, repo, true, request, function(err, version) {
        if (err != null) {
          badgeData.text[1] = err.message
          sendBadge(format, badgeData)
          return
        }
        try {
          badgeData.text[1] = 'v' + version
          if (version.indexOf('-') !== -1) {
            badgeData.colorscheme = 'yellow'
          } else if (version[0] === '0') {
            badgeData.colorscheme = 'orange'
          } else {
            badgeData.colorscheme = 'blue'
          }
          sendBadge(format, badgeData)
        } catch (e) {
          badgeData.text[1] = 'invalid'
          sendBadge(format, badgeData)
        }
      })
    })
  )

  camp.route(
    dtRegex,
    cache(function(data, match, sendBadge, request) {
      const info = getInfo(match)
      const repo = match[offset + 1] // eg, `Nuget.Core`.
      const format = match[offset + 2]
      const apiUrl = info.feed
      const badgeData = getBadgeData('downloads', data)
      getNugetData(apiUrl, repo, request, function(err, nugetData) {
        if (err != null) {
          badgeData.text[1] = err.message
          sendBadge(format, badgeData)
          return
        }
        try {
          // Official NuGet server uses "totalDownloads" whereas MyGet uses
          // "totaldownloads" (lowercase D). Ugh.
          const downloads =
            nugetData.totalDownloads || nugetData.totaldownloads || 0
          badgeData.text[1] = metric(downloads)
          badgeData.colorscheme = downloadCountColor(downloads)
          sendBadge(format, badgeData)
        } catch (e) {
          badgeData.text[1] = 'invalid'
          sendBadge(format, badgeData)
        }
      })
    })
  )
}

module.exports = {
  mapNugetFeedv2,
  mapNugetFeed,
}
