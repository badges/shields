import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Commits difference - correct, between branches')
  .get('/microsoft/vscode.json?base=standalone/0.1.x&head=release/1.21')
  .expectBadge({
    label: 'commits difference',
    message: isMetric,
    color: 'blue',
  })

t.create('Commits difference - correct, between tags')
  .get('/microsoft/vscode.json?base=1.58.0&head=1.59.0')
  .expectBadge({
    label: 'commits difference',
    message: isMetric,
    color: 'blue',
  })

t.create('Commits difference - correct, between commits')
  .get('/microsoft/vscode.json?base=3d82ef7&head=82f2db7')
  .expectBadge({
    label: 'commits difference',
    message: isMetric,
    color: 'blue',
  })

t.create('Commits difference - incorrect, between commits')
  .get('/microsoft/vscode.json?base=fffffff&head=82f2db7')
  .expectBadge({
    label: 'commits difference',
    message: 'could not establish commit difference between refs',
    color: 'red',
  })

t.create('Commits difference - incorrect, missing head')
  .get('/microsoft/vscode.json?base=fffffff')
  .expectBadge({
    label: 'commits difference',
    message: 'invalid query parameter: head',
    color: 'red',
  })
