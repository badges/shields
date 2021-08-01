import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
import { dockerBlue } from './docker-helpers.js'
export const t = await createServiceTester()

t.create('docker stars (valid, library)')
  .get('/_/ubuntu.json')
  .expectBadge({
    label: 'docker stars',
    message: isMetric,
    color: `#${dockerBlue}`,
  })

t.create('docker stars (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'docker stars',
    message: isMetric,
  })

t.create('docker stars (not found)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({ label: 'docker stars', message: 'repo not found' })
