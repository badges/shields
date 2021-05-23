import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('twitter')
  .get('/https/shields.io.svg')
  .expectRedirect(
    `/twitter/url.svg?url=${encodeURIComponent('https://shields.io')}`
  )
