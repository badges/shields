import {ServiceTester} from '../tester.js';
const t = (function() {
  export default __a;
}())

t.create('apps (valid, weekly)')
  .get('/aw/AFNetworking.json')
  .expectBadge({ label: 'apps', message: 'no longer available' })

t.create('apps (valid, total)')
  .get('/at/AFNetworking.json')
  .expectBadge({ label: 'apps', message: 'no longer available' })

t.create('apps (not found)')
  .get('/at/not-a-package.json')
  .expectBadge({ label: 'apps', message: 'no longer available' })
