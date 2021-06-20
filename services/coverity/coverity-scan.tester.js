import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('known project id')
  .get('/3997.json')
  .expectBadge({
    label: 'coverity',
    message: Joi.string().regex(/passing|passed .* new defects|pending|failed/),
  })

t.create('unknown project id')
  .get('/abc.json')
  .expectBadge({ label: 'coverity', message: 'project not found' })

t.create('404 response')
  .get('/1.json')
  .intercept(nock =>
    nock('https://scan.coverity.com/projects/1').get('/badge.json').reply(404)
  )
  .expectBadge({ label: 'coverity', message: 'project not found' })

t.create('passed')
  .get('/2.json')
  .intercept(nock =>
    nock('https://scan.coverity.com/projects/2').get('/badge.json').reply(200, {
      message: 'passed',
    })
  )
  .expectBadge({
    label: 'coverity',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('passed with defects')
  .get('/2.json')
  .intercept(nock =>
    nock('https://scan.coverity.com/projects/2').get('/badge.json').reply(200, {
      message: 'passed 51 new defects',
    })
  )
  .expectBadge({
    label: 'coverity',
    message: 'passed 51 new defects',
    color: 'yellow',
  })

t.create('pending')
  .get('/2.json')
  .intercept(nock =>
    nock('https://scan.coverity.com/projects/2').get('/badge.json').reply(200, {
      message: 'pending',
    })
  )
  .expectBadge({
    label: 'coverity',
    message: 'pending',
    color: 'orange',
  })

t.create('failed')
  .get('/2.json')
  .intercept(nock =>
    nock('https://scan.coverity.com/projects/2').get('/badge.json').reply(200, {
      message: 'failed',
    })
  )
  .expectBadge({
    label: 'coverity',
    message: 'failed',
    color: 'red',
  })
