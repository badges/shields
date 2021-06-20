import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('valid .nycrc')
  .get('/yargs/yargs.json?config=.nycrc')
  .expectBadge({ label: 'min coverage', message: isIntegerPercentage })

t.create('.nycrc is default')
  .get('/yargs/yargs.json')
  .expectBadge({ label: 'min coverage', message: isIntegerPercentage })

t.create('alternate threshold is specified')
  .get('/yargs/yargs.json?preferredThreshold=lines')
  .expectBadge({ label: 'min coverage', message: '100%' })

t.create('invalid threshold is specified')
  .get('/yargs/yargs.json?preferredThreshold=blerg')
  .expectBadge({
    label: 'min coverage',
    message: 'threshold must be "branches", "lines", or "functions"',
  })

t.create('.nycrc in monorepo')
  .get('/yargs/yargs.json?config=packages/foo/.nycrc.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/yargs/yargs/contents/packages/foo/.nycrc.json?ref=HEAD')
      .reply(200, {
        content: Buffer.from(
          JSON.stringify({
            lines: 99,
          })
        ).toString('base64'),
        encoding: 'base64',
      })
  )
  .expectBadge({ label: 'min coverage', message: isIntegerPercentage })

t.create('.nycrc with no thresholds')
  .get('/yargs/yargs.json?config=.nycrc')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/yargs/yargs/contents/.nycrc?ref=HEAD')
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
      .get('/repos/yargs/yargs/contents/package.json?ref=HEAD')
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
      .get('/repos/yargs/yargs/contents/package.json?ref=HEAD')
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

t.create('arbitrary JSON file, matching .nycrc format')
  .get('/swellaby/nyc-config.json?config=partial-coverage.json')
  .expectBadge({ label: 'min coverage', message: isIntegerPercentage })
