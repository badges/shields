import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('waffle label redirect')
  .get('/waffleio/waffle.io.svg')
  .expectRedirect('/waffle/label/waffleio/waffle.io/ready.svg')
