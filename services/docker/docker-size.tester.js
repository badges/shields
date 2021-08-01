import { isFileSize } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('docker image size (valid, library)')
  .get('/_/alpine.json')
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('docker image size (valid, library with tag)')
  .get('/_/alpine/latest.json')
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('docker image size (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('docker image size (valid, user with tag)')
  .get('/jrottenberg/ffmpeg/3.2-alpine.json')
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('docker image size (invalid, incorrect tag)')
  .get('/_/alpine/wrong-tag.json')
  .expectBadge({
    label: 'image size',
    message: 'repository or tag not found',
  })

t.create('docker image size (invalid, unknown repository)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({
    label: 'image size',
    message: 'repository not found',
  })
