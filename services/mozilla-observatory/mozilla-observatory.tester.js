'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const isMessage = Joi.alternatives()
  .try(
    Joi.string().regex(/^[ABCDEF][+-]? \([0-9]{1,3}\/100\)$/),
    Joi.string().allow('pending')
  )
  .required()

t.create('request on observatory.mozilla.org')
  .timeout(10000)
  .get('/grade-score/observatory.mozilla.org.json')
  .expectBadge({
    label: 'observatory',
    message: isMessage,
  })

t.create('request on observatory.mozilla.org with inclusion in public results')
  .timeout(10000)
  .get('/grade-score/observatory.mozilla.org.json?publish')
  .expectBadge({
    label: 'observatory',
    message: isMessage,
  })

t.create('grade without score (mock)')
  .get('/grade/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'A', score: 115 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'A',
    color: 'brightgreen',
  })

t.create('grade A with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'A', score: 115 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'A (115/100)',
    color: 'brightgreen',
  })

t.create('grade A+ with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'A+', score: 115 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'A+ (115/100)',
    color: 'brightgreen',
  })

t.create('grade A- with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'A-', score: 115 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'A- (115/100)',
    color: 'brightgreen',
  })

t.create('grade B with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'B', score: 115 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'B (115/100)',
    color: 'green',
  })

t.create('grade B+ with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'B+', score: 115 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'B+ (115/100)',
    color: 'green',
  })

t.create('grade B- with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'B-', score: 115 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'B- (115/100)',
    color: 'green',
  })

t.create('grade C with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'C', score: 80 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'C (80/100)',
    color: 'yellow',
  })

t.create('grade C+ with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'C+', score: 80 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'C+ (80/100)',
    color: 'yellow',
  })

t.create('grade C- with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'C-', score: 80 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'C- (80/100)',
    color: 'yellow',
  })

t.create('grade D with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'D', score: 15 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'D (15/100)',
    color: 'orange',
  })

t.create('grade D+ with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'D+', score: 15 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'D+ (15/100)',
    color: 'orange',
  })

t.create('grade D- with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'D-', score: 15 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'D- (15/100)',
    color: 'orange',
  })

t.create('grade E with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'E', score: 15 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'E (15/100)',
    color: 'orange',
  })

t.create('grade E+ with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'E+', score: 15 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'E+ (15/100)',
    color: 'orange',
  })

t.create('grade E- with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'E-', score: 15 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'E- (15/100)',
    color: 'orange',
  })

t.create('grade F with score (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'F', score: 0 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'F (0/100)',
    color: 'red',
  })

t.create('aborted (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'ABORTED', grade: null, score: null })
  )
  .expectBadge({
    label: 'observatory',
    message: 'aborted',
    color: 'lightgrey',
  })

t.create('failed (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FAILED', grade: null, score: null })
  )
  .expectBadge({
    label: 'observatory',
    message: 'failed',
    color: 'lightgrey',
  })

t.create('pending (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'PENDING', grade: null, score: null })
  )
  .expectBadge({
    label: 'observatory',
    message: 'pending',
    color: 'lightgrey',
  })

t.create('starting (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'STARTING', grade: null, score: null })
  )
  .expectBadge({
    label: 'observatory',
    message: 'starting',
    color: 'lightgrey',
  })

t.create('running (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'RUNNING', grade: null, score: null })
  )
  .expectBadge({
    label: 'observatory',
    message: 'running',
    color: 'lightgrey',
  })

t.create('invalid response with grade and score but not finished (mock)')
  .get('/grade-score/foo.bar.json')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'RUNNING', grade: 'A+', score: 135 })
  )
  .expectBadge({
    label: 'observatory',
    message: 'invalid response data',
    color: 'lightgrey',
  })
