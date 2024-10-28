import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('last updated date (valid package)').get('/express.json').expectBadge({
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
  .get('/express.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated date based on the version (valid scenario)')
  .get('/express.json?version=5.0.0')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated date based on the version (invalid scenario)')
  .get('/express.json?version=not-a-version')
  .expectBadge({
    label: 'last updated',
    message: 'version not found',
  })

t.create('last update scoped package (valid scenario)')
  .get('/@npm/types.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated scoped package based on the version (valid scenario)')
  .get('/@npm/types.json?version=2.0.0')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last updated scoped package based on the version (invalid scenario)')
  .get('/@npm/types.json?version=not-a-version')
  .expectBadge({
    label: 'last updated',
    message: 'version not found',
  })

t.create('last update scoped package (invalid scenario)')
  .get('/@not-a-scoped-package/not-a-valid-package.json')
  .expectBadge({
    label: 'last updated',
    message: 'package not found',
  })
