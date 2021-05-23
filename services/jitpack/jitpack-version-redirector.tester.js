import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('jitpack version redirect')
  .get('/jitpack/maven-simple.svg')
  .expectRedirect('/jitpack/v/github/jitpack/maven-simple.svg')
