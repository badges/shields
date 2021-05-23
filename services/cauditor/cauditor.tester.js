import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('no longer available')
  .get('/mi/matthiasmullie/scrapbook/master.json')
  .expectBadge({
    label: 'cauditor',
    message: 'no longer available',
  })
