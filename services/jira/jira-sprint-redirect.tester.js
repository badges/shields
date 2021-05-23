import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('jira sprint')
  .get('/https/jira.spring.io/94.svg')
  .expectRedirect(
    `/jira/sprint/94.svg?baseUrl=${encodeURIComponent(
      'https://jira.spring.io'
    )}`
  )
