import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('polymart downloads redirect')
  .get('/323.svg')
  .expectRedirect('/voxel-shop/downloads/323.svg')
