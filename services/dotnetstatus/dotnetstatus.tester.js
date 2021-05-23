import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('no longer available (previously get package status)')
  .get('/gh/jaredcnance/dotnet-status/API.json')
  .expectBadge({
    label: 'dotnet status',
    message: 'no longer available',
  })
