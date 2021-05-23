import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('no longer available (dw)')
  .get('/dw/github/jitpack/maven-simple.json')
  .expectBadge({
    label: 'jitpack',
    message: 'no longer available',
  })

t.create('no longer available (dm)')
  .get('/dm/github/jitpack/maven-simple.json')
  .expectBadge({
    label: 'jitpack',
    message: 'no longer available',
  })
