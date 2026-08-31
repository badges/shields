import { isVPlusDottedVersionNClauses } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Voxel Shop Plugin (id 323)').get('/323.json').expectBadge({
  label: 'voxel.shop',
  message: isVPlusDottedVersionNClauses,
})

t.create('Invalid Resource (id 0)').get('/0.json').expectBadge({
  label: 'voxel.shop',
  message: 'not found',
})
