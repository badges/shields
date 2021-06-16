import {ServiceTester} from '../tester.js';

export const t = new ServiceTester({
  id: 'Waffle',
  title: 'WaffleLabel',
  pathPrefix: '/waffle/label',
})

t.create('no longer available')
  .get('/ritwickdey/vscode-live-server/bug.json')
  .expectBadge({
    label: 'waffle',
    message: 'no longer available',
  })
