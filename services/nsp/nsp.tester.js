import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('no longer available (previously package)')
  .get('/gh-badges.json')
  .expectBadge({
    label: 'nsp',
    message: 'no longer available',
  })

t.create('no longer available (previously package version)')
  .get('/gh-badges/2.1.0.json')
  .expectBadge({
    label: 'nsp',
    message: 'no longer available',
  })

t.create('no longer available (previously scoped package)')
  .get('/@babel/core.json')
  .expectBadge({
    label: 'nsp',
    message: 'no longer available',
  })

t.create('no longer available (previously scoped package version)')
  .get('/@babel/core/7.1.6.json')
  .expectBadge({
    label: 'nsp',
    message: 'no longer available',
  })
