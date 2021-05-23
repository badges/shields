import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())
import {dockerBlue} from './docker-helpers.js';

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
