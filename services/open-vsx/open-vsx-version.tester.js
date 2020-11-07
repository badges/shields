'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex } = require('../test-validators')

const isVersion = withRegex(/^v(\d+\.\d+\.\d+)(\.\d+)?$/)
const isNotFound = withRegex(/^extension not found$/)
const baseUrl = 'https://open-vsx.org/api'

t.create('version invalid extension')
  .get('/v/badges/shields.json')
  .expectBadge({
    label: 'open vsx',
    message: isNotFound,
  })

t.create('version live').get('/v/redhat/java.json').expectBadge({
  label: 'open vsx',
  message: isVersion,
})

t.create('version pre-release')
  .get('/v/redhat/java.json')
  .intercept(nock =>
    nock(baseUrl).get('/redhat/java').reply(200, {
      version: '0.69.0',
      timestamp: '2020-10-15T13:40:16.986723Z',
    })
  )
  .expectBadge({
    label: 'open vsx',
    message: 'v0.69.0',
    color: 'orange',
  })

t.create('version')
  .get('/v/redhat/java.json')
  .intercept(nock =>
    nock(baseUrl).get(`/redhat/java`).reply(200, {
      version: '1.0.0',
      timestamp: '2020-10-15T13:40:16.986723Z',
    })
  )
  .expectBadge({
    label: 'open vsx',
    message: 'v1.0.0',
    color: 'blue',
  })
