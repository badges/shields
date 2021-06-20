import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
import { dockerBlue } from './docker-helpers.js'
export const t = await createServiceTester()

t.create('docker pulls (valid, library)')
  .get('/_/ubuntu.json')
  .expectBadge({
    label: 'docker pulls',
    message: isMetric,
    color: `#${dockerBlue}`,
  })

t.create('docker pulls (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'docker pulls',
    message: isMetric,
  })

t.create('docker pulls (not found)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({ label: 'docker pulls', message: 'repo not found' })
