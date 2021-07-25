import { createServiceTester } from '../tester.js'
import { noToken } from '../test-helpers.js'
import _noWheelmapToken from './wheelmap.service.js'
export const t = await createServiceTester()
const noWheelmapToken = noToken(_noWheelmapToken)

t.create('node with accessibility')
  .skipWhen(noWheelmapToken)
  .get('/26699541.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'yes',
    color: 'brightgreen',
  })

t.create('node with limited accessibility')
  .skipWhen(noWheelmapToken)
  .get('/2034868974.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'limited',
    color: 'yellow',
  })

t.create('node without accessibility')
  .skipWhen(noWheelmapToken)
  .get('/-147495158.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'no',
    color: 'red',
  })

t.create('node not found')
  .skipWhen(noWheelmapToken)
  .get('/0.json')
  .timeout(7500)
  .expectBadge({
    label: 'accessibility',
    message: 'node not found',
  })
