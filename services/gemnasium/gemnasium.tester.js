import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('no longer available (previously dependencies)')
  .get('/mathiasbynens/he.json')
  .expectBadge({
    label: 'gemnasium',
    message: 'no longer available',
  })
