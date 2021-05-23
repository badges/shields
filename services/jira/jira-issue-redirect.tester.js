import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('jira issue')
  .get('/https/issues.apache.org/jira/kafka-2896.svg')
  .expectRedirect(
    `/jira/issue/kafka-2896.svg?baseUrl=${encodeURIComponent(
      'https://issues.apache.org/jira'
    )}`
  )
