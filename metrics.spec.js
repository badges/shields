'use strict'

const { expect } = require('chai')
const nock = require('nock')
const sinon = require('sinon')
const got = require('./core/got-test-client')

let server
let scope
let clock
before(function () {
  this.timeout('5s')
  // remove args coming from mocha
  // https://github.com/badges/shields/issues/3365
  process.argv = []
  process.env.NODE_CONFIG = JSON.stringify({
    public: {
      metrics: {
        prometheus: { enabled: true },
        influx: {
          enabled: true,
          url: 'http://localhost:1112/metrics',
          instanceIdFrom: 'env-var',
          instanceIdEnvVarName: 'INSTANCE_ID',
          envLabel: 'localhost-env',
          intervalSeconds: 1,
        },
      },
    },
    private: {
      influx_username: 'influx-username',
      influx_password: 'influx-password',
    },
  })
  process.env.INSTANCE_ID = 'test-instance'
  clock = sinon.useFakeTimers()
  server = require('./server')
})

after('shut down the server', async function () {
  await server.stop()
  nock.cleanAll()
  delete process.env.INSTANCE_ID
  delete process.env.NODE_CONFIG
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
  await got('http://localhost:1111/badge/fruit-apple-green.svg')

  await clock.tickAsync(1100)

  expect(scope.isDone()).to.be.equal(
    true,
    `pending mocks: ${scope.pendingMocks()}`
  )
})
