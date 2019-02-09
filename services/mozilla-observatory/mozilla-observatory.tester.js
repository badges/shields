'use strict'

const Joi = require('joi')
const t = (module.exports = require('..').createServiceTester())

const validColors = ['brightgreen', 'green', 'yellow', 'orange', 'red']

t.create('request on observatory.mozilla.org')
  .get('/observatory.mozilla.org.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'observatory',
      value: Joi.string().regex(/^[ABCDEF][+-]? \([0-9]{1,3}\/100\)$/),
      color: Joi.string()
        .valid(validColors)
        .required(),
    })
  )

t.create('grade A (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'A', score: 115 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'A (115/100)',
    color: 'brightgreen',
  })

t.create('grade A+ (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'A+', score: 115 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'A+ (115/100)',
    color: 'brightgreen',
  })

t.create('grade A- (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'A-', score: 115 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'A- (115/100)',
    color: 'brightgreen',
  })

t.create('grade B (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'B', score: 115 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'B (115/100)',
    color: 'green',
  })

t.create('grade B+ (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'B+', score: 115 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'B+ (115/100)',
    color: 'green',
  })

t.create('grade B- (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'B-', score: 115 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'B- (115/100)',
    color: 'green',
  })

t.create('grade C (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'C', score: 80 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'C (80/100)',
    color: 'yellow',
  })

t.create('grade C+ (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'C+', score: 80 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'C+ (80/100)',
    color: 'yellow',
  })

t.create('grade C- (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'C-', score: 80 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'C- (80/100)',
    color: 'yellow',
  })

t.create('grade D (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'D', score: 15 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'D (15/100)',
    color: 'orange',
  })

t.create('grade D+ (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'D+', score: 15 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'D+ (15/100)',
    color: 'orange',
  })

t.create('grade D- (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'D-', score: 15 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'D- (15/100)',
    color: 'orange',
  })

t.create('grade E (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'E', score: 15 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'E (15/100)',
    color: 'orange',
  })

t.create('grade E+ (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'E+', score: 15 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'E+ (15/100)',
    color: 'orange',
  })

t.create('grade E- (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'E-', score: 15 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'E- (15/100)',
    color: 'orange',
  })

t.create('grade F (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FINISHED', grade: 'F', score: 0 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'F (0/100)',
    color: 'red',
  })

t.create('aborted (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'ABORTED', grade: null, score: null })
  )
  .expectJSON({
    name: 'observatory',
    value: 'aborted',
    color: 'lightgrey',
  })

t.create('failed (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'FAILED', grade: null, score: null })
  )
  .expectJSON({
    name: 'observatory',
    value: 'failed',
    color: 'lightgrey',
  })

t.create('pending (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'PENDING', grade: null, score: null })
  )
  .expectJSON({
    name: 'observatory',
    value: 'pending',
    color: 'lightgrey',
  })

t.create('starting (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'STARTING', grade: null, score: null })
  )
  .expectJSON({
    name: 'observatory',
    value: 'starting',
    color: 'lightgrey',
  })

t.create('running (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'RUNNING', grade: null, score: null })
  )
  .expectJSON({
    name: 'observatory',
    value: 'running',
    color: 'lightgrey',
  })

t.create('invalid response with grade and score but not finished (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .post('/api/v1/analyze?host=foo.bar')
      .reply(200, { state: 'RUNNING', grade: 'A+', score: 135 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'invalid response data',
    color: 'lightgrey',
  })
