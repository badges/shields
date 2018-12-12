'use strict'

const path = require('path')
const Raven = require('raven')

const serverSecrets = require('./lib/server-secrets')
Raven.config(process.env.SENTRY_DSN || serverSecrets.sentry_dsn).install()
Raven.disableConsoleAlerts()

const { loadServiceClasses } = require('./services')
const analytics = require('./lib/analytics')
const config = require('./lib/server-config')
const GithubConstellation = require('./services/github/github-constellation')
const PrometheusMetrics = require('./lib/sys/prometheus-metrics')
const sysMonitor = require('./lib/sys/monitor')
const log = require('./lib/log')
const { staticBadgeUrl } = require('./lib/make-badge-url')
const makeBadge = require('./gh-badges/lib/make-badge')
const suggest = require('./lib/suggest')
const { makeBadgeData } = require('./lib/badge-data')
const { handleRequest, clearRequestCache } = require('./lib/request-handler')
const { clearRegularUpdateCache } = require('./lib/regular-update')
const { makeSend } = require('./lib/result-sender')

const camp = require('camp').start({
  documentRoot: path.join(__dirname, 'public'),
  port: config.bind.port,
  hostname: config.bind.address,
  secure: config.ssl.isSecure,
  cert: config.ssl.cert,
  key: config.ssl.key,
})

const githubConstellation = new GithubConstellation({
  persistence: config.persistence,
  service: config.services.github,
})
const metrics = new PrometheusMetrics(config.metrics.prometheus)
const { apiProvider: githubApiProvider } = githubConstellation

function reset() {
  clearRequestCache()
  clearRegularUpdateCache()
}

async function stop() {
  await githubConstellation.stop()
  analytics.cancelAutosaving()
  return new Promise(resolve => {
    camp.close(resolve)
  })
}

module.exports = {
  camp,
  reset,
  stop,
}

log(`Server is starting up: ${config.baseUri}`)

analytics.load()
analytics.scheduleAutosaving()
analytics.setRoutes(camp)

if (serverSecrets && serverSecrets.shieldsSecret) {
  sysMonitor.setRoutes(camp)
}

githubConstellation.initialize(camp)
metrics.initialize(camp)

suggest.setRoutes(config.cors.allowedOrigin, githubApiProvider, camp)

camp.notfound(/\.(svg|png|gif|jpg|json)/, (query, match, end, request) => {
  const format = match[1]
  const badgeData = makeBadgeData('404', query)
  badgeData.text[1] = 'badge not found'
  badgeData.colorscheme = 'red'
  // Add format to badge data.
  badgeData.format = format
  const svg = makeBadge(badgeData)
  makeSend(format, request.res, end)(svg)
})

camp.notfound(/.*/, (query, match, end, request) => {
  end(null, { template: '404.html' })
})

// Vendors.

loadServiceClasses().forEach(serviceClass =>
  serviceClass.register(
    { camp, handleRequest, githubApiProvider },
    {
      handleInternalErrors: config.handleInternalErrors,
      cacheHeaders: config.cacheHeaders,
      profiling: config.profiling,
    }
  )
)

// Any badge, old version. This route must be registered last.
camp.route(/^\/([^/]+)\/(.+).png$/, (queryParams, match, end, ask) => {
  const [, label, message] = match
  const { color } = queryParams

  const redirectUrl = staticBadgeUrl({
    label,
    message,
    color,
    format: 'png',
  })

  ask.res.statusCode = 301
  ask.res.setHeader('Location', redirectUrl)

  // The redirect is permanent.
  const cacheDuration = (365 * 24 * 3600) | 0 // 1 year
  ask.res.setHeader('Cache-Control', `max-age=${cacheDuration}`)

  ask.res.end()
})

if (config.redirectUri) {
  camp.route(/^\/$/, (data, match, end, ask) => {
    ask.res.statusCode = 302
    ask.res.setHeader('Location', config.redirectUri)
    ask.res.end()
  })
}
