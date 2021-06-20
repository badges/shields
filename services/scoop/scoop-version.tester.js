import { ServiceTester } from '../tester.js'
import { isVPlusDottedVersionNClauses } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'scoop',
  title: 'Scoop',
})

// version

t.create('version (valid)').get('/v/apache.json').expectBadge({
  label: 'scoop',
  message: isVPlusDottedVersionNClauses,
})

t.create('version (not found)').get('/v/not-a-real-app.json').expectBadge({
  label: 'scoop',
  message: 'not-a-real-app not found in bucket "main"',
})

// version (custom bucket)

t.create('version (valid custom bucket)')
  .get('/v/dnspy.json?bucket=extras')
  .expectBadge({
    label: 'scoop',
    message: isVPlusDottedVersionNClauses,
  })

t.create('version (not found in custom bucket)')
  .get('/v/not-a-real-app.json?bucket=extras')
  .expectBadge({
    label: 'scoop',
    message: 'not-a-real-app not found in bucket "extras"',
  })

t.create('version (wrong bucket)')
  .get('/v/not-a-real-app.json?bucket=not-a-real-bucket')
  .expectBadge({
    label: 'scoop',
    message: 'bucket "not-a-real-bucket" not found',
  })
