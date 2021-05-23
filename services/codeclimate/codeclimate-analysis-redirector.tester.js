import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('Maintainability letter alias')
  .get('/maintainability-letter/jekyll/jekyll.svg')
  .expectRedirect('/codeclimate/maintainability/jekyll/jekyll.svg')
