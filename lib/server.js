'use strict'

const bytes = require('bytes')
const path = require('path')
const url = require('url')
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

const publicConfigSchema = Joi.object({
  bind: {
    port: Joi.number().port(),
    address: Joi.alternatives().try(
      Joi.string()
        .ip()
        .required(),
      Joi.string()
        .hostname()
        .required()
    ),
  },
  metrics: {
    prometheus: {
      enabled: Joi.boolean().required(),
      allowedIps: Joi.array()
        .items(Joi.string().ip())
        .required(),
    },
  },
  ssl: {
    isSecure: Joi.boolean().required(),
    key: Joi.string(),
    cert: Joi.string(),
  },
  redirectUrl: optionalUrl,
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
          .min(1)
          .required(),
      },
    },
    trace: Joi.boolean().required(),
  },
  profiling: {
    makeBadge: Joi.boolean().required(),
  },
  cacheHeaders: {
    defaultCacheLengthSeconds: Joi.number()
      .integer()
      .required(),
  },
  rateLimit: Joi.boolean().required(),
  handleInternalErrors: Joi.boolean().required(),
  fetchLimit: Joi.string().regex(/^[0-9]+(b|kb|mb|gb|tb)$/i),
}).required()

const privateConfigSchema = Joi.object({
  azure_devops_token: Joi.string(),
  bintray_user: Joi.string(),
  bintray_apikey: Joi.string(),
  gh_client_id: Joi.string(),
  gh_client_secret: Joi.string(),
  gh_token: Joi.string(),
  jenkins_user: Joi.string(),
  jenkins_pass: Joi.string(),
  jira_user: Joi.string(),
  jira_pass: Joi.string(),
  nexus_user: Joi.string(),
  nexus_pass: Joi.string(),
  npm_token: Joi.string(),
  sentry_dsn: Joi.string(),
  shields_ips: Joi.array().items(Joi.string().ip()),
  shields_secret: Joi.string(),
  sl_insight_userUuid: Joi.string(),
  sl_insight_apiToken: Joi.string(),
  sonarqube_token: Joi.string(),
  wheelmap_token: Joi.string(),
}).required()

module.exports = class Server {
  constructor(config) {
    const publicConfig = Joi.attempt(config.public, publicConfigSchema)
    let privateConfig
    try {
      privateConfig = Joi.attempt(config.private, privateConfigSchema)
    } catch (e) {
      const badPaths = e.details.map(({ path }) => path)
      throw Error(
        `Private configuration is invalid. Check these paths: ${badPaths.join(
          ','
        )}`
      )
    }
    this.config = {
      public: publicConfig,
      private: privateConfig,
    }

    this.githubConstellation = new GithubConstellation({
      persistence: publicConfig.persistence,
      service: publicConfig.services.github,
    })
    this.metrics = new PrometheusMetrics(publicConfig.metrics.prometheus)
  }

  get port() {
    const {
      port,
      ssl: { isSecure },
    } = this.config.public
    return port || (isSecure ? 443 : 80)
  }

  get baseUrl() {
    const {
      bind: { address, port },
      ssl: { isSecure },
    } = this.config.public

    return url.format({
      protocol: isSecure ? 'https' : 'http',
      hostname: address,
      port,
      pathname: '/',
    })
  }

  registerErrorHandlers() {
    const { camp } = this

    camp.notfound(/\.(svg|png|gif|jpg|json)/, (query, match, end, request) => {
      const format = match[1]
      const badgeData = makeBadgeData('404', query)
      badgeData.text[1] = 'badge not found'
      badgeData.colorB = 'red'
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
          handleInternalErrors: config.public.handleInternalErrors,
          cacheHeaders: config.public.cacheHeaders,
          profiling: config.public.profiling,
          fetchLimitBytes: bytes(config.public.fetchLimit),
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

    if (config.public.redirectUrl) {
      camp.route(/^\/$/, (data, match, end, ask) => {
        ask.res.statusCode = 302
        ask.res.setHeader('Location', config.public.redirectUrl)
        ask.res.end()
      })
    }
  }

  async start() {
    const {
      bind: { port, address: hostname },
      ssl: { isSecure: secure, cert, key },
      cors: { allowedOrigin },
      rateLimit,
    } = this.config.public

    log(`Server is starting up: ${this.baseUrl}`)

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

    const { apiProvider: githubApiProvider } = this.githubConstellation
    suggest.setRoutes(allowedOrigin, githubApiProvider, camp)

    this.registerErrorHandlers()
    this.registerServices()
    this.registerRedirects()

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
