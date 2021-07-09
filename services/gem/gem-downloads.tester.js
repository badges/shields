import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('total downloads (valid)').get('/dt/rails.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('total downloads (not found)')
  .get('/dt/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'gem not found' })

t.create('version downloads (valid, stable version)')
  .get('/dv/rails/stable.json')
  .expectBadge({
    label: 'downloads@stable',
    message: isMetric,
  })

t.create('version downloads (valid, specific version)')
  .get('/dv/rails/4.1.0.json')
  .expectBadge({
    label: 'downloads@4.1.0',
    message: isMetric,
  })

t.create('version downloads (package not found)')
  .get('/dv/not-a-package/4.1.0.json')
  .expectBadge({ label: 'downloads', message: 'gem not found' })

t.create('version downloads (valid package, invalid version)')
  .get('/dv/rails/not-a-version.json')
  .expectBadge({
    label: 'downloads',
    message: 'version should be "stable" or valid semver',
  })

t.create('version downloads (valid package, version not found)')
  .get('/dv/rails/8.8.8.json')
  .expectBadge({
    label: 'downloads',
    message: 'version not found',
  })

t.create('version downloads (valid package, version not specified)')
  .get('/dv/rails.json')
  .expectBadge({
    label: 'downloads',
    message: 'version downloads requires a version',
  })

t.create('latest version downloads (valid)')
  .get('/dtv/rails.json')
  .expectBadge({
    label: 'downloads@latest',
    message: isMetric,
  })

t.create('latest version downloads (not found)')
  .get('/dtv/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'gem not found' })
