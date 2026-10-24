import Joi from 'joi'
import dayjs from 'dayjs'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const demoToken = 'dLElUDv3iVpz3liB8axf-Q'
const unknownToken = 'AAAAAAAAAAAAAAAAAAAAAA'

const isDrillMessage = Joi.string().regex(
  /^(passed|failed|did not finish) .+ ago$|^no drills yet$/,
)

t.create('restore drill (live)')
  .get(`/${demoToken}.json`)
  .expectBadge({ label: 'restore drill', message: isDrillMessage })

t.create('restore drill, unknown token')
  .get(`/${unknownToken}.json`)
  .expectBadge({ label: 'restore drill', message: 'not found' })

function drillStatus(token, body) {
  return nock =>
    nock('https://app.backupdrill.com')
      .get(`/api/v1/drill-status/${token}`)
      .reply(200, body)
}

const recent = dayjs().subtract(2, 'days').toISOString()
const old = dayjs().subtract(40, 'days').toISOString()

t.create('restore drill passed recently')
  .get('/recent-pass.json')
  .intercept(
    drillStatus('recent-pass', {
      result: 'passed',
      finishedAt: recent,
      restoreSeconds: 42,
    }),
  )
  .expectBadge({
    label: 'restore drill',
    message: 'passed 2 days ago',
    color: 'brightgreen',
  })

t.create('restore drill passed a while ago')
  .get('/old-pass.json')
  .intercept(
    drillStatus('old-pass', {
      result: 'passed',
      finishedAt: old,
      restoreSeconds: 42,
    }),
  )
  .expectBadge({
    label: 'restore drill',
    message: 'passed a month ago',
    color: 'yellow',
  })

t.create('restore drill failed')
  .get('/failed.json')
  .intercept(
    drillStatus('failed', {
      result: 'failed',
      finishedAt: recent,
      restoreSeconds: 12,
    }),
  )
  .expectBadge({
    label: 'restore drill',
    message: 'failed 2 days ago',
    color: 'red',
  })

t.create('restore drill did not finish')
  .get('/error.json')
  .intercept(
    drillStatus('error', {
      result: 'error',
      finishedAt: recent,
      restoreSeconds: null,
    }),
  )
  .expectBadge({
    label: 'restore drill',
    message: 'did not finish 2 days ago',
    color: 'orange',
  })

t.create('restore drill, none yet')
  .get('/none.json')
  .intercept(
    drillStatus('none', {
      result: 'none',
      finishedAt: null,
      restoreSeconds: null,
    }),
  )
  .expectBadge({
    label: 'restore drill',
    message: 'no drills yet',
    color: 'lightgrey',
  })

t.create('restore drill, invalid response')
  .get('/invalid.json')
  .intercept(
    drillStatus('invalid', {
      result: 'unexpected',
      finishedAt: null,
      restoreSeconds: null,
    }),
  )
  .expectBadge({ label: 'restore drill', message: 'invalid response data' })
