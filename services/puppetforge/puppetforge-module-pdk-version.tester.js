import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('PDK version').get('/tragiccode/azure_key_vault.json').expectBadge({
  label: 'pdk version',
  message: isSemver,
})

t.create("PDK version (library doesn't use the PDK)")
  .get('/puppet/yum.json')
  .expectBadge({
    label: 'pdk version',
    message: 'none',
  })

t.create('PDK version (not found)')
  .get('/notarealuser/notarealpackage.json')
  .expectBadge({
    label: 'pdk version',
    message: 'not found',
  })
