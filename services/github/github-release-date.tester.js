'use strict'

const { isFormattedDate } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Release Date. e.g release date|today')
  .get('/release-date/mochajs/mocha.json')
  .expectBadge({
    label: 'release date',
    message: isFormattedDate,
    link: [
      `https://github.com/mochajs/mocha`,
      `https://github.com/mochajs/mocha/releases/latest`,
    ],
  })

t.create(
  'Release Date - Should return `no releases or repo not found` for invalid repo'
)
  .get('/release-date/not-valid-name/not-valid-repo.json')
  .expectBadge({
    label: 'release date',
    message: 'no releases or repo not found',
  })

t.create('(Pre-)Release Date. e.g release date|today')
  .get('/release-date-pre/mochajs/mocha.json')
  .expectBadge({
    label: 'release date',
    message: isFormattedDate,
    link: [
      `https://github.com/mochajs/mocha`,
      `https://github.com/mochajs/mocha/releases`,
    ],
  })

t.create(
  '(Pre-)Release Date - Should return `no releases or repo not found` for invalid repo'
)
  .get('/release-date-pre/not-valid-name/not-valid-repo.json')
  .expectBadge({
    label: 'release date',
    message: 'no releases or repo not found',
  })
