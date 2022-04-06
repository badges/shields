import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Release Date')
  .get('/sra_tools/iuc.json')
  .expectBadge({ label: 'release date', message: isFormattedDate })

t.create('Release Date - repository not found')
  .get('/sra_tool/iuc.json')
  .expectBadge({ label: 'release date', message: 'not found' })

t.create('Release Date - owner not found')
  .get('/sra_tools/iu.json')
  .expectBadge({ label: 'release date', message: 'not found' })
