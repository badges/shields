import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('last updated date, no tag, valid package')
  .get('/verdaccio.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated date, no tag, invalid package')
  .get('/not-a-package.json')
  .expectBadge({
    label: 'last updated',
    message: 'package not found',
  })

t.create('last updated date, no tag, custom repository, valid package')
  .get('/verdaccio.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated date, no tag, valid package with scope')
  .get('/@npm/types.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated date, no tag, invalid package with scope')
  .get('/@not-a-scoped-package/not-a-valid-package.json')
  .expectBadge({
    label: 'last updated',
    message: 'package not found',
  })

t.create('last updated date, with tag, valid package')
  .get('/verdaccio/latest.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated date, with tag, invalid package')
  .get('/not-a-package/doesnt-matter.json')
  .expectBadge({
    label: 'last updated',
    message: 'package not found',
  })

t.create('last updated date, with tag, invalid tag')
  .get('/verdaccio/not-a-valid-tag.json')
  .expectBadge({
    label: 'last updated',
    message: 'tag not found',
  })

t.create('last updated date, with tag, custom repository, valid package')
  .get('/verdaccio/latest.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated date, with tag, valid package with scope')
  .get('/@npm/types/latest.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated date, with tag, invalid package with scope')
  .get('/@not-a-scoped-package/not-a-valid-package/doesnt-matter.json')
  .expectBadge({
    label: 'last updated',
    message: 'package not found',
  })
