'use strict'

const { expect } = require('chai')
const nock = require('nock')
const sinon = require('sinon')

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
          intervalSeconds: 0.001,
        },
      },
    },
    private: {
      influx_username: 'influx-username',
      influx_password: 'influx-password',
    },
  })
  process.env.INSTANCE_ID = 'test-instance'
  scope = nock('http://localhost:1112', {
    reqheaders: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .persist()
    .post(
      '/metrics'
      // TODO check body
    )
    .basicAuth({ user: 'influx-username', pass: 'influx-password' })
    .reply(200)
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

it('should push metrics', async function () {
  // TODO add request and verify custom metrics
  await clock.tickAsync(2)
  expect(scope.isDone()).to.be.equal(
    true,
    `pending mocks: ${scope.pendingMocks()}`
  )
})
