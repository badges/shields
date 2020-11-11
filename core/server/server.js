'use strict'
/**
 * @module
 */

const path = require('path')
const url = require('url')
const { URL } = url
const cloudflareMiddleware = require('cloudflare-middleware')
const bytes = require('bytes')
const Camp = require('@shields_io/camp')
const originalJoi = require('joi')
const makeBadge = require('../../badge-maker/lib/make-badge')
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
const InfluxMetrics = require('./influx-metrics')

const Joi = originalJoi
  .extend(base => ({
    type: 'arrayFromString',
    base: base.array(),
    coerce: (value, state, options) => ({
      value: typeof value === 'string' ? value.split(' ') : value,
    }),
  }))
  .extend(base => ({
    type: 'string',
    base: base.string(),
    messages: {
      'string.origin':
        'needs to be an origin string, e.g. https://host.domain with optional port and no trailing slash',
    },
    rules: {
      origin: {
        validate(value, helpers) {
          let origin
          try {
            ;({ origin } = new URL(value))
          } catch (e) {}
          if (origin !== undefined && origin === value) {
            return value
          } else {
            return helpers.error('string.origin')
          }
        },
      },
    },
  }))

const optionalUrl = Joi.string().uri({ scheme: ['http', 'https'] })
const requiredUrl = optionalUrl.required()
const origins = Joi.arrayFromString().items(Joi.string().origin())
const defaultService = Joi.object({ authorizedOrigins: origins }).default({
  authorizedOrigins: [],
})

const publicConfigSchema = Joi.object({
  bind: {
    port: Joi.alternatives().try(
      Joi.number().port(),
      Joi.string().pattern(/^\\\\\.\\pipe\\.+$/)
    ),
    address: Joi.alternatives().try(
      Joi.string().ip().required(),
      Joi.string().hostname().required()
    ),
  },
  metrics: {
    prometheus: {
      enabled: Joi.boolean().required(),
      endpointEnabled: Joi.boolean().required(),
    },
    influx: {
      enabled: Joi.boolean().required(),
      url: Joi.string()
        .uri()
        .when('enabled', { is: true, then: Joi.required() }),
      timeoutMilliseconds: Joi.number()
        .integer()
        .min(1)
        .when('enabled', { is: true, then: Joi.required() }),
      intervalSeconds: Joi.number()
        .integer()
        .min(1)
        .when('enabled', { is: true, then: Joi.required() }),
      instanceIdFrom: Joi.string()
        .equal('hostname', 'env-var', 'random')
        .when('enabled', { is: true, then: Joi.required() }),
      instanceIdEnvVarName: Joi.string().when('instanceIdFrom', {
        is: 'env-var',
        then: Joi.required(),
      }),
      envLabel: Joi.string().when('enabled', {
        is: true,
        then: Joi.required(),
      }),
      hostnameAliases: Joi.object(),
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
    allowedOrigin: Joi.array().items(optionalUrl).required(),
  },
  services: Joi.object({
    bitbucketServer: defaultService,
    drone: defaultService,
    github: {
      baseUri: requiredUrl,
      debug: {
        enabled: Joi.boolean().required(),
        intervalSeconds: Joi.number().integer().min(1).required(),
      },
    },
    jira: defaultService,
    jenkins: Joi.object({
      authorizedOrigins: origins,
      requireStrictSsl: Joi.boolean(),
      requireStrictSslToAuthenticate: Joi.boolean(),
    }).default({ authorizedOrigins: [] }),
    nexus: defaultService,
    npm: defaultService,
    sonar: defaultService,
    teamcity: defaultService,
    trace: Joi.boolean().required(),
  }).required(),
  cacheHeaders: {
    defaultCacheLengthSeconds: Joi.number().integer().required(),
  },
  rateLimit: Joi.boolean().required(),
  handleInternalErrors: Joi.boolean().required(),
  fetchLimit: Joi.string().regex(/^[0-9]+(b|kb|mb|gb|tb)$/i),
  documentRoot: Joi.string().default(
    path.resolve(__dirname, '..', '..', 'public')
  ),
  requireCloudflare: Joi.boolean().required(),
}).required()

const privateConfigSchema = Joi.object({
  azure_devops_token: Joi.string(),
  bintray_user: Joi.string(),
  bintray_apikey: Joi.string(),
  discord_bot_token: Joi.string(),
  drone_token: Joi.string(),
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
  shields_secret: Joi.string(),
  sl_insight_userUuid: Joi.string(),
  sl_insight_apiToken: Joi.string(),
  sonarqube_token: Joi.string(),
  teamcity_user: Joi.string(),
  teamcity_pass: Joi.string(),
  twitch_client_id: Joi.string(),
  twitch_client_secret: Joi.string(),
  wheelmap_token: Joi.string(),
  influx_username: Joi.string(),
  influx_password: Joi.string(),
  youtube_api_key: Joi.string(),
}).required()
const privateMetricsInfluxConfigSchema = privateConfigSchema.append({
  influx_username: Joi.string().required(),
  influx_password: Joi.string().required(),
})

function addHandlerAtIndex(camp, index, handlerFn) {
  camp.stack.splice(index, 0, handlerFn)
}

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
   * by https://www.npmjs.com/package/config and validated against
   * publicConfigSchema and privateConfigSchema
   * @see https://github.com/badges/shields/blob/master/doc/production-hosting.md#configuration
   * @see https://github.com/badges/shields/blob/master/doc/server-secrets.md
   */
  constructor(config) {
    const publicConfig = Joi.attempt(config.public, publicConfigSchema)
    const privateConfig = this.validatePrivateConfig(
      config.private,
      privateConfigSchema
    )
    // We want to require an username and a password for the influx metrics
    // only if the influx metrics are enabled. The private config schema
    // and the public config schema are two separate schemas so we have to run
    // validation manually.
    if (publicConfig.metrics.influx && publicConfig.metrics.influx.enabled) {
      this.validatePrivateConfig(
        config.private,
        privateMetricsInfluxConfigSchema
      )
    }
    this.config = {
      public: publicConfig,
      private: privateConfig,
    }

    this.githubConstellation = new GithubConstellation({
      service: publicConfig.services.github,
      private: privateConfig,
    })

    if (publicConfig.metrics.prometheus.enabled) {
      this.metricInstance = new PrometheusMetrics()
      if (publicConfig.metrics.influx.enabled) {
        this.influxMetrics = new InfluxMetrics(
          this.metricInstance,
          Object.assign({}, publicConfig.metrics.influx, {
            username: privateConfig.influx_username,
            password: privateConfig.influx_password,
          })
        )
      }
    }
  }

  validatePrivateConfig(privateConfig, privateConfigSchema) {
    try {
      return Joi.attempt(privateConfig, privateConfigSchema)
    } catch (e) {
      const badPaths = e.details.map(({ path }) => path)
      throw Error(
        `Private configuration is invalid. Check these paths: ${badPaths.join(
          ','
        )}`
      )
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

  // See https://www.viget.com/articles/heroku-cloudflare-the-right-way/
  requireCloudflare() {
    // Set `req.ip`, which is expected by `cloudflareMiddleware()`. This is set
    // by Express but not Scoutcamp.
    addHandlerAtIndex(this.camp, 0, function (req, res, next) {
      // On Heroku, `req.socket.remoteAddress` is the Heroku router. However,
      // the router ensures that the last item in the `X-Forwarded-For` header
      // is the real origin.
      // https://stackoverflow.com/a/18517550/893113
      req.ip = process.env.DYNO
        ? req.headers['x-forwarded-for'].split(', ').pop()
        : req.socket.remoteAddress
      next()
    })
    addHandlerAtIndex(this.camp, 1, cloudflareMiddleware())
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
      makeSend(
        'svg',
        request.res,
        end
      )(
        makeBadge({
          label: '410',
          message: `${format} no longer available`,
          color: 'lightgray',
          format: 'svg',
        })
      )
    })

    if (!rasterUrl) {
      camp.route(/\.png$/, (query, match, end, request) => {
        makeSend(
          'svg',
          request.res,
          end
        )(
          makeBadge({
            label: '404',
            message: 'raster badges not available',
            color: 'lightgray',
            format: 'svg',
          })
        )
      })
    }

    camp.notfound(/(\.svg|\.json|)$/, (query, match, end, request) => {
      const [, extension] = match
      const format = (extension || '.svg').replace(/^\./, '')

      makeSend(
        format,
        request.res,
        end
      )(
        makeBadge({
          label: '404',
          message: 'badge not found',
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
          fetchLimitBytes: bytes(config.public.fetchLimit),
          rasterUrl: config.public.rasterUrl,
          private: config.private,
          public: config.public,
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
      requireCloudflare,
    } = this.config.public

    log(`Server is starting up: ${this.baseUrl}`)

    const camp = (this.camp = Camp.create({
      documentRoot: this.config.public.documentRoot,
      port,
      hostname,
      secure,
      staticMaxAge: 300,
      cert,
      key,
    }))

    if (requireCloudflare) {
      this.requireCloudflare()
    }

    const { metricInstance } = this
    this.cleanupMonitor = sysMonitor.setRoutes(
      { rateLimit },
      { server: camp, metricInstance }
    )

    const { githubConstellation } = this
    await githubConstellation.initialize(camp)
    if (metricInstance) {
      if (this.config.public.metrics.prometheus.endpointEnabled) {
        metricInstance.registerMetricsEndpoint(camp)
      }
      if (this.influxMetrics) {
        this.influxMetrics.startPushingMetrics()
      }
    }

    const { apiProvider: githubApiProvider } = this.githubConstellation
    suggest.setRoutes(allowedOrigin, githubApiProvider, camp)

    this.registerErrorHandlers()
    this.registerRedirects()
    this.registerServices()

    camp.listenAsConfigured()

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
      if (this.influxMetrics) {
        this.influxMetrics.stopPushingMetrics()
      }
      this.metricInstance.stop()
    }
  }
}

module.exports = Server
