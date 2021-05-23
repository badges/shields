import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('Users')
  .get('/IndieGala-Helper.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Users (not found)')
  .get('/not-a-real-plugin.json')
  .expectBadge({ label: 'users', message: 'not found' })
