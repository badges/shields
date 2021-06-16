import {ServiceTester} from '../tester.js';

export const t = new ServiceTester({
  id: 'dockbit',
  title: 'Dockbit',
})

t.create('no longer available (previously image size)')
  .get('/image-size/_/ubuntu/latest.json')
  .expectBadge({
    label: 'dockbit',
    message: 'no longer available',
  })

t.create('no longer available (previously number of layers)')
  .get('/layers/_/ubuntu/latest.json')
  .expectBadge({
    label: 'dockbit',
    message: 'no longer available',
  })
