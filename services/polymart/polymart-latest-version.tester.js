import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('polymart version redirect')
  .get('/323.svg')
  .expectRedirect('/voxel-shop/v/323.svg')
