import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'PolymartRatingRedirect',
  title: 'PolymartRatingRedirect',
  pathPrefix: '/polymart',
})

t.create('polymart rating redirect')
  .get('/rating/323.svg')
  .expectRedirect('/voxel-shop/rating/323.svg')

t.create('polymart stars redirect')
  .get('/stars/323.svg')
  .expectRedirect('/voxel-shop/stars/323.svg')
