import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('no longer available')
  .get('/ritwickdey/vscode-live-server/bug.json')
  .expectBadge({
    label: 'waffle',
    message: 'no longer available',
  })
