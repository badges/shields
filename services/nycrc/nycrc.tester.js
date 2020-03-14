'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('valid .nycrc')
  .get('/yargs/yargs.json?config=.nycrc')
  .expectBadge({ label: 'min coverage', message: isIntegerPercentage })

t.create('.nycrc is default')
  .get('/yargs/yargs.json')
  .expectBadge({ label: 'min coverage', message: isIntegerPercentage })

t.create('.nycrc with no thresholds')
  .get('/yargs/yargs.json?config=.nycrc')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/yargs/yargs/contents/.nycrc?ref=master')
      .reply(200, {
        content: Buffer.from(
          JSON.stringify({
            reporter: 'foo',
          })
        ).toString('base64'),
        encoding: 'base64',
      })
  )
  .expectBadge({
    label: 'min coverage',
    message: '"branches" or "lines" threshold missing',
  })

t.create('package.json with nyc stanza')
  .get('/yargs/yargs.json?config=package.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/yargs/yargs/contents/package.json?ref=master')
      .reply(200, {
        content: Buffer.from(
          JSON.stringify({
            nyc: {
              lines: 99,
            },
          })
        ).toString('base64'),
        encoding: 'base64',
      })
  )
  .expectBadge({ label: 'min coverage', message: isIntegerPercentage })

t.create('package.json with nyc stanza, but no thresholds')
  .get('/yargs/yargs.json?config=package.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/yargs/yargs/contents/package.json?ref=master')
      .reply(200, {
        content: Buffer.from(
          JSON.stringify({
            nyc: {},
          })
        ).toString('base64'),
        encoding: 'base64',
      })
  )
  .expectBadge({
    label: 'min coverage',
    message: '"branches" or "lines" threshold missing',
  })

t.create('package.json with no nyc stanza')
  .get('/badges/shields.json?config=package.json')
  .expectBadge({
    label: 'min coverage',
    message: 'no nyc or c8 stanza found',
  })
