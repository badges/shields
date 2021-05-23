import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('Build: default branch')
  .get('.svg?url=https://example.com/badge.json')
  .expectRedirect('/endpoint.svg?url=https://example.com/badge.json')
