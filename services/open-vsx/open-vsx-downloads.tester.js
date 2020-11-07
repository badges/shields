'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex, isMetric } = require('../test-validators')

const isNotFound = withRegex(/^extension not found$/)
const baseUrl = 'https://open-vsx.org/api'

t.create('downloads invalid extension')
  .get('/dt/badges/shields.json')
  .expectBadge({
    label: 'downloads',
    message: isNotFound,
  })

t.create('downloads live').get('/dt/redhat/java.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('downloads')
  .get('/dt/redhat/java.json')
  .intercept(nock =>
    nock(baseUrl).get(`/redhat/java`).reply(200, {
      version: '0.69.0',
      timestamp: '2020-10-15T13:40:16.986723Z',
      downloadCount: 29000,
    })
  )
  .expectBadge({
    label: 'downloads',
    message: '29k',
    color: 'brightgreen',
  })

t.create('downloads version')
  .get('/dt/redhat/java/latest.json')
  .intercept(nock =>
    nock(baseUrl).get(`/redhat/java/latest`).reply(200, {
      version: '0.69.0',
      timestamp: '2020-10-15T13:40:16.986723Z',
      downloadCount: 29000,
    })
  )
  .expectBadge({
    label: 'downloads@0.69.0',
    message: '29k',
    color: 'brightgreen',
  })

t.create('zero downloads')
  .get('/dt/redhat/java.json')
  .intercept(nock =>
    nock(baseUrl).get(`/redhat/java`).reply(200, {
      version: '0.69.0',
      timestamp: '2020-10-15T13:40:16.986723Z',
      downloadCount: 0,
    })
  )
  .expectBadge({
    label: 'downloads',
    message: '0',
    color: 'red',
  })
