'use strict'

const path = require('path')
const Joi = require('joi')
const Camp = require('camp')
const makeBadge = require('../gh-badges/lib/make-badge')
const GithubConstellation = require('../services/github/github-constellation')
const { loadServiceClasses } = require('../services')
const analytics = require('./analytics')
const { makeBadgeData } = require('./badge-data')
const log = require('./log')
const { staticBadgeUrl } = require('./make-badge-url')
const suggest = require('./suggest')
const sysMonitor = require('./sys/monitor')
const PrometheusMetrics = require('./sys/prometheus-metrics')
const { makeSend } = require('./result-sender')
const { handleRequest, clearRequestCache } = require('./request-handler')
const { clearRegularUpdateCache } = require('./regular-update')

const optionalUrl = Joi.string().uri({ scheme: ['http', 'https'] })
const requiredUrl = optionalUrl.required()

const configSchema = Joi.object({
  bind: {
    port: Joi.number()
      .port()
      .required(),
    address: Joi.alternatives()
      .try(
        Joi.string()
          .ip()
          .required(),
        Joi.string()
          .hostname()
          .required()
      )
      .required(),
  },
  metrics: {
    prometheus: {
      enabled: Joi.boolean().required(),
      allowedIps: Joi.string(),
    },
  },
  ssl: {
    isSecure: Joi.boolean().required(),
    key: Joi.string(),
    cert: Joi.string(),
  },
  baseUri: requiredUrl,
  redirectUri: optionalUrl,
  cors: {
    allowedOrigin: Joi.array()
      .items(optionalUrl)
      .required(),
  },
  persistence: {
    dir: Joi.string().required(),
    redisUrl: optionalUrl,
  },
  services: {
    github: {
      baseUri: requiredUrl,
      debug: {
        enabled: Joi.boolean().required(),
        intervalSeconds: Joi.number()
          .integer()
          .min(1),
      },
    },
    trace: Joi.boolean().required(),
  },
  profiling: {
    makeBadge: Joi.boolean().required(),
  },
  cacheHeaders: {
    defaultCacheLengthSeconds: Joi.number().integer(),
  },
  rateLimit: Joi.boolean().required(),
  handleInternalErrors: Joi.boolean().required(),
}).required()

module.exports = class Server {
  constructor(config) {
    Joi.assert(config, configSchema)
    this.config = config

    this.githubConstellation = new GithubConstellation({
      persistence: config.persistence,
      service: config.services.github,
    })
    this.metrics = new PrometheusMetrics(config.metrics.prometheus)
  }

  get baseUrl() {
    return this.config.baseUri
  }

  registerErrorHandlers() {
    const { camp } = this

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
  }

  registerServices() {
    const { config, camp } = this
    const { apiProvider: githubApiProvider } = this.githubConstellation

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
  }

  registerRedirects() {
    const { config, camp } = this

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
  }

  async start() {
    const {
      bind: { port, address: hostname },
      ssl: { isSecure: secure, cert, key },
      cors: { allowedOrigin },
      baseUri,
      rateLimit,
    } = this.config

    log(`Server is starting up: ${baseUri}`)

    const camp = (this.camp = Camp.start({
      documentRoot: path.join(__dirname, '..', 'public'),
      port,
      hostname,
      secure,
      cert,
      key,
    }))

    analytics.load()
    analytics.scheduleAutosaving()
    analytics.setRoutes(camp)

    this.cleanupMonitor = sysMonitor.setRoutes({ rateLimit }, camp)

    const { githubConstellation, metrics } = this
    githubConstellation.initialize(camp)
    metrics.initialize(camp)

    const { githubApiProvider } = this.githubConstellation
    suggest.setRoutes(allowedOrigin, githubApiProvider, camp)

    this.registerErrorHandlers()
    this.registerServices()

    await new Promise(resolve => camp.on('listening', () => resolve()))
  }

  static resetGlobalState() {
    // This state should be migrated to instance state. When possible, do not add new
    // global state.
    clearRequestCache()
    clearRegularUpdateCache()
  }

  reset() {
    this.constructor.resetGlobalState()
  }

  async stop() {
    if (this.camp) {
      await new Promise(resolve => this.camp.close(resolve))
      this.camp = undefined
    }

    if (this.cleanupMonitor) {
      this.cleanupMonitor()
      this.cleanupMonitor = undefined
    }

    if (this.githubConstellation) {
      await this.githubConstellation.stop()
      this.githubConstellation = undefined
    }

    analytics.cancelAutosaving()
  }
}
