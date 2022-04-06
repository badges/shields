import { withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('version - repository')
  .get('/sra_tools/iuc.json')
  .expectBadge({
    label: 'sra_tools',
    message: withRegex(/^([\w\d]+)$/),
  })

// Not found
t.create('not found - repository').get('/sra_too/iuc.json').expectBadge({
  label: 'galaxy-toolshed',
  message: 'not found',
})
t.create('not found - owner').get('/sra_tool/iu.json').expectBadge({
  label: 'galaxy-toolshed',
  message: 'not found',
})
