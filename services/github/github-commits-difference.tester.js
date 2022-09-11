import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Commits difference - correct, between branches')
  .get('/microsoft/vscode/err-telemetry...main.json')
  .expectBadge({
    label: 'commits difference',
    message: isMetric,
    color: 'blue',
  })

t.create('Commits difference - correct, between tags')
  .get('/microsoft/vscode/1.58.0...1.59.0.json')
  .expectBadge({
    label: 'commits difference',
    message: isMetric,
    color: 'blue',
  })

t.create('Commits difference - correct, between commits')
  .get('/microsoft/vscode/3d82ef7...82f2db7.json')
  .expectBadge({
    label: 'commits difference',
    message: isMetric,
    color: 'blue',
  })

t.create('Commits difference - incorrect, between commits')
  .get('/microsoft/vscode/fffffff...82f2db7.json')
  .expectBadge({
    label: 'commits difference',
    message:
      'could not establish commit difference between branches/tags/commits',
    color: 'red',
  })
