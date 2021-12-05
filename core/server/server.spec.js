import path from 'path'
import { fileURLToPath } from 'url'
import { expect } from 'chai'
import isSvg from 'is-svg'
import config from 'config'
import nock from 'nock'
import sinon from 'sinon'
import got from '../got-test-client.js'
import Server from './server.js'
import { createTestServer } from './in-process-server-test-helpers.js'

describe('The server', function () {
  describe('running', function () {
    let server, baseUrl
    before('Start the server', async function () {
      // Fixes https://github.com/badges/shields/issues/2611
      this.timeout(10000)
      server = await createTestServer({
        public: {
          documentRoot: path.resolve(
            path.dirname(fileURLToPath(import.meta.url)),
            'test-public'
          ),
        },
      })
      baseUrl = server.baseUrl
      await server.start()
    })
    after('Shut down the server', async function () {
      if (server) {
        await server.stop()
      }
      server = undefined
    })

    it('should allow strings for port', async function () {
      // fixes #4391 - This allows the app to be run using iisnode, which uses a named pipe for the port.
      const pipeServer = await createTestServer({
        public: {
          bind: {
            port: '\\\\.\\pipe\\9c137306-7c4d-461e-b7cf-5213a3939ad6',
          },
        },
      })
      expect(pipeServer).to.not.be.undefined
    })

    it('should produce colorscheme badges', async function () {
      const { statusCode, body } = await got(`${baseUrl}:fruit-apple-green.svg`)
      expect(statusCode).to.equal(200)
      expect(body)
        .to.satisfy(isSvg)
        .and.to.include('fruit')
        .and.to.include('apple')
    })

    it('should serve front-end with default maxAge', async function () {
      const { headers } = await got(`${baseUrl}/`)
      expect(headers['cache-control']).to.equal('max-age=300, s-maxage=300')
    })

    it('should serve badges with custom maxAge', async function () {
      const { headers } = await got(`${baseUrl}npm/l/express`)
      expect(headers['cache-control']).to.equal('max-age=3600, s-maxage=3600')
    })

    it('should return cors header for the request', async function () {
      const { statusCode, headers } = await got(`${baseUrl}npm/v/express.svg`)
      expect(statusCode).to.equal(200)
      expect(headers['access-control-allow-origin']).to.equal('*')
    })

    it('should redirect colorscheme PNG badges as configured', async function () {
      const { statusCode, headers } = await got(
        `${baseUrl}:fruit-apple-green.png`,
        {
          followRedirect: false,
        }
      )
      expect(statusCode).to.equal(301)
      expect(headers.location).to.equal(
        'http://raster.example.test/:fruit-apple-green.png'
      )
    })

    it('should redirect modern PNG badges as configured', async function () {
      const { statusCode, headers } = await got(`${baseUrl}npm/v/express.png`, {
        followRedirect: false,
      })
      expect(statusCode).to.equal(301)
      expect(headers.location).to.equal(
        'http://raster.example.test/npm/v/express.png'
      )
    })

    it('should produce SVG badges with expected headers', async function () {
      const { statusCode, headers } = await got(
        `${baseUrl}:fruit-apple-green.svg`
      )
      expect(statusCode).to.equal(200)
      expect(headers['content-type']).to.equal('image/svg+xml;charset=utf-8')
      expect(headers['content-length']).to.equal('1130')
    })

    it('correctly calculates the content-length header for multi-byte unicode characters', async function () {
      const { headers } = await got(`${baseUrl}:fruit-apple🍏-green.json`)
      expect(headers['content-length']).to.equal('100')
    })

    it('should produce JSON badges with expected headers', async function () {
      const { statusCode, body, headers } = await got(
        `${baseUrl}:fruit-apple-green.json`
      )
      expect(statusCode).to.equal(200)
      expect(headers['content-type']).to.equal('application/json')
      expect(headers['access-control-allow-origin']).to.equal('*')
      expect(headers['content-length']).to.equal('92')
      expect(() => JSON.parse(body)).not.to.throw()
    })

    it('should preserve label case', async function () {
      const { statusCode, body } = await got(`${baseUrl}:fRuiT-apple-green.svg`)
      expect(statusCode).to.equal(200)
      expect(body).to.satisfy(isSvg).and.to.include('fRuiT')
    })

    // https://github.com/badges/shields/pull/1319
    it('should not crash with a numeric logo', async function () {
      const { statusCode, body } = await got(
        `${baseUrl}:fruit-apple-green.svg?logo=1`
      )
      expect(statusCode).to.equal(200)
      expect(body)
        .to.satisfy(isSvg)
        .and.to.include('fruit')
        .and.to.include('apple')
    })

    it('should not crash with a numeric link', async function () {
      const { statusCode, body } = await got(
        `${baseUrl}:fruit-apple-green.svg?link=1`
      )
      expect(statusCode).to.equal(200)
      expect(body)
        .to.satisfy(isSvg)
        .and.to.include('fruit')
        .and.to.include('apple')
    })

    it('should not crash with a boolean link', async function () {
      const { statusCode, body } = await got(
        `${baseUrl}:fruit-apple-green.svg?link=true`
      )
      expect(statusCode).to.equal(200)
      expect(body)
        .to.satisfy(isSvg)
        .and.to.include('fruit')
        .and.to.include('apple')
    })

    it('should return the 404 badge for unknown badges', async function () {
      const { statusCode, body } = await got(
        `${baseUrl}this/is/not/a/badge.svg`,
        {
          throwHttpErrors: false,
        }
      )
      expect(statusCode).to.equal(404)
      expect(body)
        .to.satisfy(isSvg)
        .and.to.include('404')
        .and.to.include('badge not found')
    })

    it('should return the 404 badge page for rando links', async function () {
      const { statusCode, body } = await got(
        `${baseUrl}this/is/most/definitely/not/a/badge.js`,
        {
          throwHttpErrors: false,
        }
      )
      expect(statusCode).to.equal(404)
      expect(body)
        .to.satisfy(isSvg)
        .and.to.include('404')
        .and.to.include('badge not found')
    })

    it('should redirect the root as configured', async function () {
      const { statusCode, headers } = await got(baseUrl, {
        followRedirect: false,
      })

      expect(statusCode).to.equal(302)
      // This value is set in `config/test.yml`
      expect(headers.location).to.equal('http://frontend.example.test')
    })

    it('should return the 410 badge for obsolete formats', async function () {
      const { statusCode, body } = await got(`${baseUrl}npm/v/express.jpg`, {
        throwHttpErrors: false,
      })
      // TODO It would be nice if this were 404 or 410.
      expect(statusCode).to.equal(200)
      expect(body)
        .to.satisfy(isSvg)
        .and.to.include('410')
        .and.to.include('jpg no longer available')
    })

    it('should return cors header for the request', async function () {
      const { statusCode, headers } = await got(`${baseUrl}npm/v/express.svg`)
      expect(statusCode).to.equal(200)
      expect(headers['access-control-allow-origin']).to.equal('*')
    })
  })

  context('`requireCloudflare` is enabled', function () {
    let server
    afterEach(async function () {
      if (server) {
        server.stop()
      }
    })

    it('should reject requests from localhost with an empty 200 response', async function () {
      this.timeout(10000)
      server = await createTestServer({ public: { requireCloudflare: true } })
      await server.start()

      const { statusCode, body } = await got(
        `${server.baseUrl}badge/foo-bar-blue.svg`
      )

      expect(statusCode).to.be.equal(200)
      expect(body).to.equal('')
    })
  })

  describe('`requestTimeoutSeconds` setting', function () {
    let server

    beforeEach(async function () {
      this.timeout(10000)

      // configure server to time out requests that take >2 seconds
      server = await createTestServer({ public: { requestTimeoutSeconds: 2 } })
      await server.start()

      // /fast returns a 200 OK after a 1 second delay
      server.camp.route(/^\/fast$/, (data, match, end, ask) => {
        setTimeout(() => {
          ask.res.statusCode = 200
          ask.res.end()
        }, 1000)
      })

      // /slow returns a 200 OK after a 3 second delay
      server.camp.route(/^\/slow$/, (data, match, end, ask) => {
        setTimeout(() => {
          ask.res.statusCode = 200
          ask.res.end()
        }, 3000)
      })
    })

    afterEach(async function () {
      if (server) {
        server.stop()
      }
      server = undefined
    })

    it('should time out slow requests', async function () {
      this.timeout(10000)
      const { statusCode, body } = await got(`${server.baseUrl}slow`, {
        throwHttpErrors: false,
      })
      expect(statusCode).to.be.equal(408)
      expect(body).to.equal('Request Timeout')
    })

    it('should not time out fast requests', async function () {
      this.timeout(10000)
      const { statusCode, body } = await got(`${server.baseUrl}fast`)
      expect(statusCode).to.be.equal(200)
      expect(body).to.equal('')
    })
  })

  describe('configuration', function () {
    let server
    afterEach(async function () {
      if (server) {
        server.stop()
      }
    })

    it('should allow to enable prometheus metrics', async function () {
      // Fixes https://github.com/badges/shields/issues/2611
      this.timeout(10000)
      server = await createTestServer({
        public: {
          metrics: { prometheus: { enabled: true, endpointEnabled: true } },
        },
      })
      await server.start()

      const { statusCode } = await got(`${server.baseUrl}metrics`)

      expect(statusCode).to.be.equal(200)
    })

    it('should allow to disable prometheus metrics', async function () {
      // Fixes https://github.com/badges/shields/issues/2611
      this.timeout(10000)
      server = await createTestServer({
        public: {
          metrics: { prometheus: { enabled: true, endpointEnabled: false } },
        },
      })
      await server.start()

      const { statusCode } = await got(`${server.baseUrl}metrics`, {
        throwHttpErrors: false,
      })

      expect(statusCode).to.be.equal(404)
    })
  })

  describe('configuration validation', function () {
    describe('influx', function () {
      let customConfig
      beforeEach(function () {
        customConfig = config.util.toObject()
        customConfig.public.metrics.influx = {
          enabled: true,
          url: 'http://localhost:8081/telegraf',
          timeoutMilliseconds: 1000,
          intervalSeconds: 2,
          instanceIdFrom: 'random',
          instanceIdEnvVarName: 'INSTANCE_ID',
          hostnameAliases: { 'metrics-hostname': 'metrics-hostname-alias' },
          envLabel: 'test-env',
        }
        customConfig.private = {
          influx_username: 'telegraf',
          influx_password: 'telegrafpass',
        }
      })

      it('should not require influx configuration', function () {
        delete customConfig.public.metrics.influx
        expect(() => new Server(config.util.toObject())).to.not.throw()
      })

      it('should require url when influx configuration is enabled', function () {
        delete customConfig.public.metrics.influx.url
        expect(() => new Server(customConfig)).to.throw(
          '"metrics.influx.url" is required'
        )
      })

      it('should not require url when influx configuration is disabled', function () {
        customConfig.public.metrics.influx.enabled = false
        delete customConfig.public.metrics.influx.url
        expect(() => new Server(customConfig)).to.not.throw()
      })

      it('should require timeoutMilliseconds when influx configuration is enabled', function () {
        delete customConfig.public.metrics.influx.timeoutMilliseconds
        expect(() => new Server(customConfig)).to.throw(
          '"metrics.influx.timeoutMilliseconds" is required'
        )
      })

      it('should require intervalSeconds when influx configuration is enabled', function () {
        delete customConfig.public.metrics.influx.intervalSeconds
        expect(() => new Server(customConfig)).to.throw(
          '"metrics.influx.intervalSeconds" is required'
        )
      })

      it('should require instanceIdFrom when influx configuration is enabled', function () {
        delete customConfig.public.metrics.influx.instanceIdFrom
        expect(() => new Server(customConfig)).to.throw(
          '"metrics.influx.instanceIdFrom" is required'
        )
      })

      it('should require instanceIdEnvVarName when instanceIdFrom is env-var', function () {
        customConfig.public.metrics.influx.instanceIdFrom = 'env-var'
        delete customConfig.public.metrics.influx.instanceIdEnvVarName
        expect(() => new Server(customConfig)).to.throw(
          '"metrics.influx.instanceIdEnvVarName" is required'
        )
      })

      it('should allow instanceIdFrom = hostname', function () {
        customConfig.public.metrics.influx.instanceIdFrom = 'hostname'
        expect(() => new Server(customConfig)).to.not.throw()
      })

      it('should allow instanceIdFrom = env-var', function () {
        customConfig.public.metrics.influx.instanceIdFrom = 'env-var'
        expect(() => new Server(customConfig)).to.not.throw()
      })

      it('should allow instanceIdFrom = random', function () {
        customConfig.public.metrics.influx.instanceIdFrom = 'random'
        expect(() => new Server(customConfig)).to.not.throw()
      })

      it('should require envLabel when influx configuration is enabled', function () {
        delete customConfig.public.metrics.influx.envLabel
        expect(() => new Server(customConfig)).to.throw(
          '"metrics.influx.envLabel" is required'
        )
      })

      it('should not require hostnameAliases', function () {
        delete customConfig.public.metrics.influx.hostnameAliases
        expect(() => new Server(customConfig)).to.not.throw()
      })

      it('should allow empty hostnameAliases', function () {
        customConfig.public.metrics.influx.hostnameAliases = {}
        expect(() => new Server(customConfig)).to.not.throw()
      })

      it('should require username when influx configuration is enabled', function () {
        delete customConfig.private.influx_username
        expect(() => new Server(customConfig)).to.throw(
          'Private configuration is invalid. Check these paths: influx_username'
        )
      })

      it('should require password when influx configuration is enabled', function () {
        delete customConfig.private.influx_password
        expect(() => new Server(customConfig)).to.throw(
          'Private configuration is invalid. Check these paths: influx_password'
        )
      })

      it('should allow other private keys', function () {
        customConfig.private.gh_token = 'my-token'
        expect(() => new Server(customConfig)).to.not.throw()
      })
    })
  })

  describe('running with metrics enabled', function () {
    let server, baseUrl, scope, clock
    const metricsPushIntervalSeconds = 1
    before('Start the server', async function () {
      // Fixes https://github.com/badges/shields/issues/2611
      this.timeout(10000)
      process.env.INSTANCE_ID = 'test-instance'
      server = await createTestServer({
        public: {
          metrics: {
            prometheus: { enabled: true },
            influx: {
              enabled: true,
              url: 'http://localhost:1112/metrics',
              instanceIdFrom: 'env-var',
              instanceIdEnvVarName: 'INSTANCE_ID',
              envLabel: 'localhost-env',
              intervalSeconds: metricsPushIntervalSeconds,
            },
          },
        },
        private: {
          influx_username: 'influx-username',
          influx_password: 'influx-password',
        },
      })
      clock = sinon.useFakeTimers()
      baseUrl = server.baseUrl
      await server.start()
    })
    after('Shut down the server', async function () {
      if (server) {
        await server.stop()
      }
      server = undefined
      nock.cleanAll()
      delete process.env.INSTANCE_ID
      clock.restore()
    })

    it('should push custom metrics', async function () {
      scope = nock('http://localhost:1112', {
        reqheaders: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .post(
          '/metrics',
          /prometheus,application=shields,category=static,env=localhost-env,family=static-badge,instance=test-instance,service=static_badge service_requests_total=1\n/
        )
        .basicAuth({ user: 'influx-username', pass: 'influx-password' })
        .reply(200)
      await got(`${baseUrl}badge/fruit-apple-green.svg`)

      await clock.tickAsync(1000 * metricsPushIntervalSeconds + 500)

      expect(scope.isDone()).to.be.equal(
        true,
        `pending mocks: ${scope.pendingMocks()}`
      )
    })
  })
})
