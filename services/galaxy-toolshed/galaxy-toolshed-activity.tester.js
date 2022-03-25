import { isFormattedDate } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'galaxy-toolshed',
  title: 'GalaxyToolshed',
})

t.create('Create Date')
  .get('/create-date/sra_tools/iuc.json')
  .expectBadge({ label: 'create date', message: isFormattedDate })

t.create('Create Date - repositoryName not found')
  .get('/create-date/sra_tool/iuc.json')
  .expectBadge({ label: 'create date', message: 'not found' })

t.create('Create Date - owner not found')
  .get('/create-date/sra_tools/iu.json')
  .expectBadge({ label: 'create date', message: 'not found' })
