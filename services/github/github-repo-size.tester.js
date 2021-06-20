import { isFileSize } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('repository size').get('/badges/shields.json').expectBadge({
  label: 'repo size',
  message: isFileSize,
})

t.create('repository size (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({
    label: 'repo size',
    message: 'repo not found',
  })
