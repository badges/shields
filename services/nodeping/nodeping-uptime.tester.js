'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isPercentage } = require('../test-validators')

t.create('NodePing uptime - live')
  .get('/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json')
  .expectBadge({
    label: 'Uptime',
    message: isPercentage,
  })

t.create('NodePing uptime - 100% (mock)')
  .get('/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json')
  .intercept(nock =>
    nock('https://nodeping.com')
      .get(
        `/reports/uptime/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei?format=json&interval=days&start=${new Date(
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .slice(0, 10)}`
      )
      .reply(200, [{ uptime: 100 }])
  )
  .expectBadge({
    label: 'Uptime',
    message: '100%',
    color: 'brightgreen',
  })

t.create('NodePing uptime - 99.999% (mock)')
  .get('/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json')
  .intercept(nock =>
    nock('https://nodeping.com')
      .get(
        `/reports/uptime/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei?format=json&interval=days&start=${new Date(
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .slice(0, 10)}`
      )
      .reply(200, [{ uptime: 99.999 }])
  )
  .expectBadge({
    label: 'Uptime',
    message: '99.999%',
    color: 'green',
  })

t.create('NodePing uptime - 99.001% (mock)')
  .get('/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json')
  .intercept(nock =>
    nock('https://nodeping.com')
      .get(
        `/reports/uptime/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei?format=json&interval=days&start=${new Date(
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .slice(0, 10)}`
      )
      .reply(200, [{ uptime: 99.001 }])
  )
  .expectBadge({
    label: 'Uptime',
    message: '99.001%',
    color: 'yellow',
  })

t.create('NodePing uptime - 90.001% (mock)')
  .get('/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json')
  .intercept(nock =>
    nock('https://nodeping.com')
      .get(
        `/reports/uptime/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei?format=json&interval=days&start=${new Date(
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .slice(0, 10)}`
      )
      .reply(200, [{ uptime: 90.001 }])
  )
  .expectBadge({
    label: 'Uptime',
    message: '90.001%',
    color: 'red',
  })
