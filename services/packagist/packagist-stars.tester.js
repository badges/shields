import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Stars (valid package)').get('/guzzlehttp/guzzle.json').expectBadge({
  label: 'stars',
  message: isMetric,
})

t.create('Stars (invalid package)')
  .get('/frodo/is-not-a-package.json')
  .expectBadge({
    label: 'stars',
    message: 'not found',
  })

t.create('Stars (valid package, valid custom server)')
  .get('/guzzlehttp/guzzle.json?server=https%3A%2F%2Fpackagist.org')
  .expectBadge({
    label: 'stars',
    message: isMetric,
  })

t.create('Stars (invalid package, valid custom server)')
  .get('/frodo/is-not-a-package.json?server=https%3A%2F%2Fpackagist.org')
  .expectBadge({
    label: 'stars',
    message: 'not found',
  })

t.create('Stars (valid package, invalid custom server)')
  .get('/guzzlehttp/guzzle.json?server=https%3A%2F%2Fexample.com')
  .expectBadge({
    label: 'stars',
    message: 'not found',
  })

t.create('Stars (invalid package, invalid custom server)')
  .get('/frodo/is-not-a-package.json?server=https%3A%2F%2Fexample.com')
  .expectBadge({
    label: 'stars',
    message: 'not found',
  })
