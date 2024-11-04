import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('last updated date (valid package)')
  .get('/verdaccio.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated date (invalid package)')
  .get('/not-a-package.json')
  .expectBadge({
    label: 'last updated',
    message: 'package not found',
  })

t.create('last update from custom repository (valid scenario)')
  .get('/verdaccio.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last update scoped package (valid scenario)')
  .get('/@npm/types.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last update scoped package (invalid scenario)')
  .get('/@not-a-scoped-package/not-a-valid-package.json')
  .expectBadge({
    label: 'last updated',
    message: 'package not found',
  })

t.create('last updated date with tag (valid scenario)')
  .get('/verdaccio/latest.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated date (invalid tag)')
  .get('/verdaccio/not-a-valid-tag.json')
  .expectBadge({
    label: 'last updated',
    message: 'tag not found',
  })
