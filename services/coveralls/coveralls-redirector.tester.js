import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('Coveralls VCS type missing')
  .get('/lemurheavy/coveralls-ruby.svg')
  .expectRedirect('/coveralls/github/lemurheavy/coveralls-ruby.svg')
