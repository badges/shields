import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('docker last updated (valid, library)')
  .get('/_/alpine.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('docker last updated (valid, library with tag)')
  .get('/_/alpine/latest.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('docker last updated (valid, user)')
  .get('/datadog/dogstatsd.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('docker last updated (valid, user with tag)')
  .get('/jrottenberg/ffmpeg/3.2-alpine.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('docker last updated (invalid, incorrect tag)')
  .get('/_/alpine/wrong-tag.json')
  .expectBadge({
    label: 'last updated',
    message: 'repository or tag not found',
  })

t.create('docker last updated (invalid, unknown repository)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({
    label: 'last updated',
    message: 'repository or tag not found',
  })
