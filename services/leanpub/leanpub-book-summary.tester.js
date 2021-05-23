import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('no longer available (previously book pages)')
  .get('/pages/juice-shop.json')
  .expectBadge({
    label: 'leanpub',
    message: 'no longer available',
  })

t.create('no longer available (previously books sold)')
  .get('/sold/juice-shop.json')
  .expectBadge({
    label: 'leanpub',
    message: 'no longer available',
  })
