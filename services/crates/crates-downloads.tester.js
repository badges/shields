import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('total downloads')
  .get('/d/libc.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('total downloads (with version)')
  .get('/d/libc/0.2.31.json')
  .expectBadge({
    label: 'downloads@0.2.31',
    message: isMetric,
  })

t.create('downloads for version').get('/dv/libc.json').expectBadge({
  label: 'downloads@latest',
  message: isMetric,
})

t.create('downloads for version (with version)')
  .get('/dv/libc/0.2.31.json')
  .expectBadge({
    label: 'downloads@0.2.31',
    message: isMetric,
  })

t.create('recent downloads').get('/dr/libc.json').expectBadge({
  label: 'recent downloads',
  message: isMetric,
})

t.create('recent downloads (null)')
  .get('/dr/libc.json')
  .intercept(nock =>
    nock('https://crates.io')
      .get('/api/v1/crates/libc')
      .reply(200, {
        crate: {
          downloads: 42,
          recent_downloads: null,
          max_version: '0.2.71',
        },
        versions: [{ downloads: 42, license: 'MIT OR Apache-2.0' }],
      })
  )
  .expectBadge({ label: 'recent downloads', message: '0' })

t.create('recent downloads (with version)')
  .get('/dr/libc/0.2.31.json')
  .expectBadge({
    label: 'crates.io',
    message: 'recent downloads not supported for specific versions',
  })

t.create('downloads (invalid version)')
  .get('/d/libc/7.json')
  .expectBadge({ label: 'crates.io', message: 'invalid semver: 7' })

t.create('downloads (not found)')
  .get('/d/not-a-real-package.json')
  .expectBadge({ label: 'crates.io', message: 'not found' })
