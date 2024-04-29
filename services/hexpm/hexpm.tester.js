import Joi from 'joi'
import { ServiceTester } from '../tester.js'
import {
  isMetric,
  isMetricOverTimePeriod,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} from '../test-validators.js'

export const t = new ServiceTester({ id: 'hexpm', title: 'Hex.pm' })

t.create('downloads per week')
  .get('/dw/cowboy.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('downloads per day')
  .get('/dd/cowboy.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('downloads (zero for period)')
  .get('/dd/cowboy.json')
  .intercept(nock =>
    nock('https://hex.pm/')
      .get('/api/packages/cowboy')
      .reply(200, {
        downloads: { all: 100 }, // there is no 'day' key here
        latest_stable_version: '1.0',
        latest_version: '1.0',
        meta: { licenses: ['MIT'] },
      }),
  )
  .expectBadge({ label: 'downloads', message: '0/day' })

t.create('downloads in total')
  .get('/dt/cowboy.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads (not found)')
  .get('/dt/this-package-does-not-exist.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('version').get('/v/cowboy.json').expectBadge({
  label: 'hex',
  message: isVPlusDottedVersionNClausesWithOptionalSuffix,
})

t.create('version (no stable version)')
  .get('/v/prima_opentelemetry_ex.json')
  .intercept(nock =>
    nock('https://hex.pm/')
      .get('/api/packages/prima_opentelemetry_ex')
      .reply(200, {
        downloads: { all: 100 },
        latest_stable_version: null,
        latest_version: '1.0.0-rc.3',
        meta: { licenses: ['MIT'] },
      }),
  )
  .expectBadge({
    label: 'hex',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (not found)')
  .get('/v/this-package-does-not-exist.json')
  .expectBadge({ label: 'hex', message: 'not found' })

t.create('license').get('/l/cowboy.json').expectBadge({
  label: 'license',
  message: Joi.string().required(),
  color: 'blue',
})

t.create('license (multiple licenses)')
  .get('/l/cowboy.json')
  .intercept(nock =>
    nock('https://hex.pm/')
      .get('/api/packages/cowboy')
      .reply(200, {
        downloads: { all: 100 },
        latest_stable_version: '1.0',
        latest_version: '1.0',
        meta: { licenses: ['GPLv2', 'MIT'] },
      }),
  )
  .expectBadge({
    label: 'licenses',
    message: 'GPLv2, MIT',
    color: 'blue',
  })

t.create('license (no license)')
  .get('/l/cowboy.json')
  .intercept(nock =>
    nock('https://hex.pm/')
      .get('/api/packages/cowboy')
      .reply(200, {
        downloads: { all: 100 },
        latest_stable_version: '1.0',
        latest_version: '1.0',
        meta: { licenses: [] },
      }),
  )
  .expectBadge({
    label: 'license',
    message: 'Unknown',
    color: 'lightgrey',
  })

t.create('license (not found)')
  .get('/l/this-package-does-not-exist.json')
  .expectBadge({ label: 'license', message: 'not found' })
