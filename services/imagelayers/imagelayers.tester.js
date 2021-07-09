import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'imagelayers',
  title: 'ImageLayers',
})

t.create('no longer available (previously image size)')
  .get('/image-size/_/ubuntu/latest.json')
  .expectBadge({
    label: 'imagelayers',
    message: 'no longer available',
  })

t.create('no longer available (previously number of layers)')
  .get('/layers/_/ubuntu/latest.json')
  .expectBadge({
    label: 'imagelayers',
    message: 'no longer available',
  })
