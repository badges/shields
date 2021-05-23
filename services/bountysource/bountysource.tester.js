import {isMetric} from '../test-validators.js';
import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('bounties (valid)')
  .get('/team/mozilla-core/activity.json')
  .expectBadge({
    label: 'bounties',
    message: isMetric,
  })

t.create('bounties (invalid team)')
  .get('/team/not-a-real-team/activity.json')
  .expectBadge({
    label: 'bounties',
    message: 'not found',
  })
