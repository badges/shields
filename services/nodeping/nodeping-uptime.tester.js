import { createServiceTester } from '../tester.js'
import { isPercentage } from '../test-validators.js'
export const t = await createServiceTester()

t.create('NodePing uptime')
  .get('/jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei.json')
  .expectBadge({ label: 'uptime', message: isPercentage })

t.create('NodePing uptime - 100%')
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
  .expectBadge({ label: 'uptime', message: '100%', color: 'brightgreen' })

t.create('NodePing uptime - 99.999%')
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
  .expectBadge({ label: 'uptime', message: '99.999%', color: 'green' })

t.create('NodePing uptime - 99.001%')
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
  .expectBadge({ label: 'uptime', message: '99.001%', color: 'yellow' })

t.create('NodePing uptime - 90.001%')
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
  .expectBadge({ label: 'uptime', message: '90.001%', color: 'red' })
