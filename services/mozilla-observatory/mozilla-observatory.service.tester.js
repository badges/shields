'use strict'

const { ServiceTester } = require('..')

const t = (module.exports = new ServiceTester({
  id: 'mozilla-observatory',
  title: 'Mozilla Observatory Scanner',
}))

t.create('request on httpforever')
  .get('/httpforever.com.json?style=_shields_test')
  .expectJSON({
    name: 'observatory',
    value: 'C+ (60/100)',
    color: 'yellow',
  })

t.create('grade A (mock)')
  .get('/foo.bar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://http-observatory.security.mozilla.org')
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'A', score: 115 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'A+', score: 115 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'A-', score: 115 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'B', score: 115 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'B+', score: 115 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'B-', score: 115 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'C', score: 80 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'C+', score: 80 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'C-', score: 80 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'D', score: 15 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'D+', score: 15 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'D-', score: 15 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'E', score: 15 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'E+', score: 15 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'E-', score: 15 })
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
      .get('/api/v1/analyze?host=foo.bar')
      .reply(200, { grade: 'F', score: 0 })
  )
  .expectJSON({
    name: 'observatory',
    value: 'F (0/100)',
    color: 'red',
  })
