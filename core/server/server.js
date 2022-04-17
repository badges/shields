/**
 * @module
 */

import http from 'http'
import https from 'https'
import path from 'path'
import url, { fileURLToPath } from 'url'
import express from 'express'
import { bootstrap } from 'global-agent'
import cloudflareMiddleware from 'cloudflare-middleware'
import originalJoi from 'joi'
import makeBadge from '../../badge-maker/lib/make-badge.js'
import GithubConstellation from '../../services/github/github-constellation.js'
import LibrariesIoConstellation from '../../services/librariesio/librariesio-constellation.js'
import { setRoutes as setSuggestRoutes } from '../../services/suggest.js'
import { loadServiceClasses } from '../base-service/loader.js'
import { makeJsonBadge } from '../base-service/make-json-badge.js'
import { clearResourceCache } from '../base-service/resource-cache.js'
import { rasterRedirectUrl } from '../badge-urls/make-badge-url.js'
import { fileSize, nonNegativeInteger } from '../../services/validators.js'
import log from './log.js'
import PrometheusMetrics from './prometheus-metrics.js'
import InfluxMetrics from './influx-metrics.js'
const { URL } = url

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
      intervalSeconds: Joi.number().integer().min(1).when('enabled', {
        is: true,
        then: Joi.required(),
      }),
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
    gitlab: defaultService,
    jira: defaultService,
    jenkins: Joi.object({
      authorizedOrigins: origins,
      requireStrictSsl: Joi.boolean(),
      requireStrictSslToAuthenticate: Joi.boolean(),
    }).default({ authorizedOrigins: [] }),
    nexus: defaultService,
    npm: defaultService,
    obs: defaultService,
    sonar: defaultService,
    teamcity: defaultService,
    weblate: defaultService,
    trace: Joi.boolean().required(),
  }).required(),
  cacheHeaders: { defaultCacheLengthSeconds: nonNegativeInteger },
  handleInternalErrors: Joi.boolean().required(),
  fetchLimit: fileSize,
  userAgentBase: Joi.string().required(),
  requestTimeoutSeconds: nonNegativeInteger,
  requestTimeoutMaxAgeSeconds: nonNegativeInteger,
  documentRoot: Joi.string().default(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      '..',
      'public'
    )
  ),
  requireCloudflare: Joi.boolean().required(),
}).required()

const privateConfigSchema = Joi.object({
  azure_devops_token: Joi.string(),
  discord_bot_token: Joi.string(),
  drone_token: Joi.string(),
  gh_client_id: Joi.string(),
  gh_client_secret: Joi.string(),
  gh_token: Joi.string(),
  gitlab_token: Joi.string(),
  jenkins_user: Joi.string(),
  jenkins_pass: Joi.string(),
  jira_user: Joi.string(),
  jira_pass: Joi.string(),
  bitbucket_server_username: Joi.string(),
  bitbucket_server_password: Joi.string(),
  librariesio_tokens: Joi.arrayFromString().items(Joi.string()),
  nexus_user: Joi.string(),
  nexus_pass: Joi.string(),
  npm_token: Joi.string(),
  obs_user: Joi.string(),
  obs_pass: Joi.string(),
  redis_url: Joi.string().uri({ scheme: ['redis', 'rediss'] }),
  sentry_dsn: Joi.string(),
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
  weblate_api_key: Joi.string(),
  youtube_api_key: Joi.string(),
}).required()
const privateMetricsInfluxConfigSchema = privateConfigSchema.append({
  influx_username: Joi.string().required(),
  influx_password: Joi.string().required(),
})

/**
 * The Server is based on Express. It creates an http server and sets up helpers
 * for token persistence and monitoring. Then it loads all the services,
 * injecting dependencies, as it asks each one to register its route with
 * Express.
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

    this.librariesioConstellation = new LibrariesIoConstellation({
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
    this.app.use(cloudflareMiddleware())
  }

  /**
   * Set up Scoutcamp routes for 404/not found responses
   */
  registerErrorHandlers() {
    const { app, config } = this
    const {
      public: { rasterUrl },
    } = config

    app.get(/\.(gif|jpg)$/, (req, res) => {
      res.status(410)
      res.setHeader('Content-Type', 'image/svg+xml;charset=utf-8')

      const format = req.params[0]
      res.send(
        makeBadge({
          label: '410',
          message: `${format} no longer available`,
          color: 'lightgray',
          format: 'svg',
        })
      )

      res.end()
    })

    if (!rasterUrl) {
      app.get(/\.png$/, (req, res) => {
        res.status(404)
        res.setHeader('Content-Type', 'image/svg+xml;charset=utf-8')
        res.send(
          makeBadge({
            label: '404',
            message: 'raster badges not available',
            color: 'lightgray',
          })
        )
        res.end()
      })
    }
  }

  registerNotFoundHandlers() {
    const { app } = this

    app.get(/\.json$/, (req, res) => {
      res.status(404)
      res.setHeader('Content-Type', 'application/json')
      res.json(
        transformBadgeData({
          label: '404',
          message: 'badge not found',
          color: 'red',
        })
      )
      res.end()
    })

    app.get(/(?:\.svg|)$/, (req, res) => {
      res.status(404)
      res.setHeader('Content-Type', 'image/svg+xml;charset=utf-8')
      res.send(
        makeBadge({
          label: '404',
          message: 'badge not found',
          color: 'red',
        })
      )
      res.end()
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
    const { config, app } = this
    const {
      public: { rasterUrl, redirectUrl },
    } = config

    if (rasterUrl) {
      // Redirect to the raster server for raster versions of modern badges.
      app.get(/\.png$/, (req, res) => {
        res.status(301)
        res.setHeader('Location', rasterRedirectUrl({ rasterUrl }, req.url))

        const cacheDuration = (30 * 24 * 3600) | 0 // 30 days.
        res.setHeader('Cache-Control', `max-age=${cacheDuration}`)

        res.end()
      })
    }

    if (redirectUrl) {
      app.get('/', (req, res) => {
        res.status(302)
        res.setHeader('Location', redirectUrl)
        res.end()
      })
    }

    /*
    This is here for legacy reasons. The badge server and frontend used to live
    on two different servers. When we merged them there was a conflict so we did
    this to avoid moving the endpoint docs to another URL.
    
    Never ever do this again.
    */
    app.use('/endpoint', (req, res, next) => {
      if (Object.keys(req.query).length === 0) {
        res.status(301)
        res.setHeader('Location', '/endpoint/')
        res.end()
      } else {
        next()
      }
    })
  }

  /**
   * Iterate all the service classes defined in /services,
   * load each service and register a Scoutcamp route for each service.
   */
  async registerServices() {
    const { app, config, metricInstance } = this
    const { apiProvider: githubApiProvider } = this.githubConstellation
    const { apiProvider: librariesIoApiProvider } =
      this.librariesioConstellation
    ;(await loadServiceClasses()).forEach(serviceClass =>
      serviceClass.register(
        { app, githubApiProvider, librariesIoApiProvider, metricInstance },
        {
          handleInternalErrors: config.public.handleInternalErrors,
          cacheHeaders: config.public.cacheHeaders,
          rasterUrl: config.public.rasterUrl,
          private: config.private,
          public: config.public,
        }
      )
    )
  }

  bootstrapAgent() {
    /*
    Bootstrap global agent.
    This allows self-hosting users to configure a proxy with
    HTTP_PROXY, HTTPS_PROXY, NO_PROXY variables
    */
    if (!('GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE' in process.env)) {
      process.env.GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE = ''
    }

    const proxyPrefix = process.env.GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE
    const HTTP_PROXY = process.env[`${proxyPrefix}HTTP_PROXY`] || null
    const HTTPS_PROXY = process.env[`${proxyPrefix}HTTPS_PROXY`] || null

    if (HTTP_PROXY || HTTPS_PROXY) {
      bootstrap()
    }
  }

  /**
   * Start the HTTP server:
   * Bootstrap Scoutcamp,
   * Register handlers,
   * Start listening for requests on this.baseUrl()
   *
   * @param {Function} registerExtras Optional function to register additional
   * routes, used for testing.
   */
  async start(registerExtras) {
    const {
      bind: { port, address: hostname },
      ssl: { isSecure: secure, cert, key },
      cors: { allowedOrigin },
      requireCloudflare,
    } = this.config.public

    this.bootstrapAgent()

    log.log(`Server is starting up: ${this.baseUrl}`)

    const app = (this.app = express())

    if (requireCloudflare) {
      this.requireCloudflare()
    }

    const { githubConstellation, metricInstance } = this
    await githubConstellation.initialize(app)
    if (metricInstance) {
      if (this.config.public.metrics.prometheus.endpointEnabled) {
        metricInstance.registerMetricsEndpoint(app)
      }
      if (this.influxMetrics) {
        this.influxMetrics.startPushingMetrics()
      }
    }

    const { apiProvider: githubApiProvider } = this.githubConstellation
    setSuggestRoutes(allowedOrigin, githubApiProvider, app)

    // https://github.com/badges/shields/issues/3273
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      next()
    })

    this.registerRedirects()
    app.use(
      express.static(this.config.public.documentRoot, {
        // Manually set headers, since the `maxAge` parameter sets
        // 'Cache-Control: public'.
        cacheControl: false,
        setHeaders: res =>
          res.setHeader('Cache-Control', 'max-age=300, s-maxage=300'),
      })
    )
    this.registerErrorHandlers()
    await this.registerServices()
    if (registerExtras) {
      registerExtras(app)
    }
    this.registerNotFoundHandlers()

    if (secure) {
      this.server = https.createServer({ hostname, cert, key }, app)
    } else {
      this.server = http.createServer({ hostname }, app)
    }

    this.server.setTimeout(this.config.public.requestTimeoutSeconds * 1000)

    await new Promise(resolve =>
      this.server.listen({ host: hostname, port }, () => resolve())
    )
  }

  static resetGlobalState() {
    // TODO: This state should be migrated to instance state. When possible, do
    // not add new global state.
    clearResourceCache()
  }

  reset() {
    this.constructor.resetGlobalState()
  }

  /**
   * Stop the HTTP server and clean up helpers
   */
  async stop() {
    if (this.server) {
      await new Promise(resolve => this.server.close(resolve))
      this.server = undefined
    }
    this.app = undefined

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

export default Server
