import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Created Date')
  .get('/sra_tools/iuc.json')
  .expectBadge({ label: 'created date', message: isFormattedDate })

t.create('Created Date - repository not found')
  .get('/sra_tool/iuc.json')
  .expectBadge({ label: 'created date', message: 'not found' })

t.create('Created Date - owner not found')
  .get('/sra_tools/iu.json')
  .expectBadge({ label: 'created date', message: 'not found' })

t.create('Created Date - changesetRevision not found')
  .get('/bioqc/badilla.json')
  .expectBadge({
    label: 'created date',
    message: 'changesetRevision not found',
  })
