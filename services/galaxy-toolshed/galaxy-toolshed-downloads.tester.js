import { isMetric } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'galaxy-toolshed',
  title: 'GalaxyToolshed',
})

t.create('downloads - raw').get('/downloads/sra_tools/iuc.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('downloads - repositoryName not found')
  .get('/downloads/sra_tool/iuc.json')
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })

t.create('downloads - owner not found')
  .get('/downloads/sra_tools/iu.json')
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })
