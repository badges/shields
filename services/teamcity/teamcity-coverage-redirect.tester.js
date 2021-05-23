import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('coverage')
  .get('/https/teamcity.jetbrains.com/ReactJSNet_PullRequests.svg')
  .expectRedirect(
    `/teamcity/coverage/ReactJSNet_PullRequests.svg?server=${encodeURIComponent(
      'https://teamcity.jetbrains.com'
    )}`
  )
