import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('docker version (valid, library)').get('/_/alpine.json').expectBadge({
  label: 'version',
  message: isSemver,
})

t.create('docker version (valid, library with tag)')
  .get('/_/alpine/latest.json')
  .expectBadge({
    label: 'version',
    message: isSemver,
  })

t.create('docker version (valid, user)')
  .get('/datadog/dogstatsd.json')
  .expectBadge({
    label: 'version',
    message: isSemver,
  })

t.create('docker version (valid, user with tag)')
  .get('/jrottenberg/ffmpeg/3.2-alpine.json')
  .expectBadge({
    label: 'version',
    message: isSemver,
  })

t.create('docker version (invalid, incorrect tag)')
  .get('/_/alpine/wrong-tag.json')
  .expectBadge({
    label: 'version',
    message: 'tag not found',
  })

t.create('docker version (invalid, unknown repository)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({
    label: 'version',
    message: 'repository not found',
  })
