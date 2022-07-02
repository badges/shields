import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('downloads - raw').get('/sra_tools/iuc.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('downloads - repository not found')
  .get('/sra_tool/iuc.json')
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })

t.create('downloads - owner not found').get('/sra_tools/iu.json').expectBadge({
  label: 'downloads',
  message: 'not found',
})

t.create('downloads - changesetRevision not found')
  .get('/bioqc/badilla.json')
  .expectBadge({
    label: 'downloads',
    message: 'changesetRevision not found',
  })
