import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('Offset Earth trees alias')
  .get('/trees/ecologi.svg')
  .expectRedirect('/ecologi/trees/ecologi.svg')
