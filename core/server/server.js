'use strict'
/**
 * @module
 */

const path = require('path')
const url = require('url')
const bytes = require('bytes')
const Joi = require('@hapi/joi')
const Camp = require('camp')
const makeBadge = require('../../gh-badges/lib/make-badge')
const GithubConstellation = require('../../services/github/github-constellation')
const suggest = require('../../services/suggest')
const { loadServiceClasses } = require('../base-service/loader')
const { makeSend } = require('../base-service/legacy-result-sender')
const {
  handleRequest,
  clearRequestCache,
} = require('../base-service/legacy-request-handler')
const { clearRegularUpdateCache } = require('../legacy/regular-update')
const { rasterRedirectUrl } = require('../badge-urls/make-badge-url')
const log = require('./log')
const sysMonitor = require('./monitor')
const PrometheusMetrics = require('./prometheus-metrics')

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
    },
  },
  ssl: {
    isSecure: Joi.boolean().required(),
    key: Joi.string(),
    cert: Joi.string(),
  },
  redirectUrl: optionalUrl,
  rasterUrl: optionalUrl,
  cors: {
    allowedOrigin: Joi.array()
      .items(optionalUrl)
      .required(),
  },
  persistence: {
    dir: Joi.string().required(),
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
  redis_url: Joi.string().uri({ scheme: ['redis', 'rediss'] }),
  sentry_dsn: Joi.string(),
  shields_ips: Joi.array().items(Joi.string().ip()),
  shields_secret: Joi.string(),
  sl_insight_userUuid: Joi.string(),
  sl_insight_apiToken: Joi.string(),
  sonarqube_token: Joi.string(),
  twitch_client_id: Joi.string(),
  twitch_client_secret: Joi.string(),
  wheelmap_token: Joi.string(),
}).required()

/**
 * The Server is based on the web framework Scoutcamp. It creates
 * an http server, sets up helpers for token persistence and monitoring.
 * Then it loads all the services, injecting dependencies as it
 * asks each one to register its route with Scoutcamp.
 */
class Server {
  /**
   * Badge Server Constructor
   *
   * @param {object} config Configuration object read from config yaml files
   *    by https://www.npmjs.com/package/config and validated against
   *    publicConfigSchema and privateConfigSchema
   * @see https://github.com/badges/shields/blob/master/doc/production-hosting.md#configuration
   * @see https://github.com/badges/shields/blob/master/doc/server-secrets.md
   */
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
      private: privateConfig,
    })
    if (publicConfig.metrics.prometheus.enabled) {
      this.metricInstance = new PrometheusMetrics()
    }
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

  /**
   * Set up Scoutcamp routes for 404/not found responses
   */
  registerErrorHandlers() {
    const { camp, config } = this
    const {
      public: { rasterUrl },
    } = config

    camp.route(/\.(gif|jpg)$/, (query, match, end, request) => {
      const [, format] = match
      makeSend('svg', request.res, end)(
        makeBadge({
          text: ['410', `${format} no longer available`],
          color: 'lightgray',
          format: 'svg',
        })
      )
    })

    if (!rasterUrl) {
      camp.route(/\.png$/, (query, match, end, request) => {
        makeSend('svg', request.res, end)(
          makeBadge({
            text: ['404', 'raster badges not available'],
            color: 'lightgray',
            format: 'svg',
          })
        )
      })
    }

    camp.notfound(/(\.svg|\.json|)$/, (query, match, end, request) => {
      const [, extension] = match
      const format = (extension || '.svg').replace(/^\./, '')

      makeSend(format, request.res, end)(
        makeBadge({
          text: ['404', 'badge not found'],
          color: 'red',
          format,
        })
      )
    })
  }

  /**
   * Set up a couple of redirects:
   * One for the raster badges.
   * Another to redirect the base URL /
   * (we use this to redirect {@link https://img.shields.io/}
   * to {@link https://shields.io/} )
   */
  registerRedirects() {
    const { config, camp } = this
    const {
      public: { rasterUrl, redirectUrl },
    } = config

    if (rasterUrl) {
      // Redirect to the raster server for raster versions of modern badges.
      camp.route(/\.png$/, (queryParams, match, end, ask) => {
        ask.res.statusCode = 301
        ask.res.setHeader(
          'Location',
          rasterRedirectUrl({ rasterUrl }, ask.req.url)
        )

        const cacheDuration = (30 * 24 * 3600) | 0 // 30 days.
        ask.res.setHeader('Cache-Control', `max-age=${cacheDuration}`)

        ask.res.end()
      })
    }

    if (redirectUrl) {
      camp.route(/^\/$/, (data, match, end, ask) => {
        ask.res.statusCode = 302
        ask.res.setHeader('Location', redirectUrl)
        ask.res.end()
      })
    }
  }

  /**
   * Iterate all the service classes defined in /services,
   * load each service and register a Scoutcamp route for each service.
   */
  registerServices() {
    const { config, camp, metricInstance } = this
    const { apiProvider: githubApiProvider } = this.githubConstellation

    loadServiceClasses().forEach(serviceClass =>
      serviceClass.register(
        { camp, handleRequest, githubApiProvider, metricInstance },
        {
          handleInternalErrors: config.public.handleInternalErrors,
          cacheHeaders: config.public.cacheHeaders,
          profiling: config.public.profiling,
          fetchLimitBytes: bytes(config.public.fetchLimit),
          rasterUrl: config.public.rasterUrl,
          private: config.private,
        }
      )
    )
  }

  /**
   * Start the HTTP server:
   * Bootstrap Scoutcamp,
   * Register handlers,
   * Start listening for requests on this.baseUrl()
   */
  async start() {
    const {
      bind: { port, address: hostname },
      ssl: { isSecure: secure, cert, key },
      cors: { allowedOrigin },
      rateLimit,
    } = this.config.public

    log(`Server is starting up: ${this.baseUrl}`)

    const camp = (this.camp = Camp.start({
      documentRoot: path.resolve(__dirname, '..', '..', 'public'),
      port,
      hostname,
      secure,
      cert,
      key,
    }))

    const { metricInstance } = this
    this.cleanupMonitor = sysMonitor.setRoutes(
      { rateLimit },
      { server: camp, metricInstance }
    )

    const { githubConstellation } = this
    githubConstellation.initialize(camp)
    if (metricInstance) {
      metricInstance.initialize(camp)
    }

    const { apiProvider: githubApiProvider } = this.githubConstellation
    suggest.setRoutes(allowedOrigin, githubApiProvider, camp)

    // https://github.com/badges/shields/issues/3273
    camp.handle((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      next()
    })

    this.registerErrorHandlers()
    this.registerRedirects()
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

  /**
   * Stop the HTTP server and clean up helpers
   */
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

    if (this.metricInstance) {
      this.metricInstance.stop()
    }
  }
}

module.exports = Server
