import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Commits difference - correct, between branches')
  .get('/microsoft/vscode.json?branchA=standalone/0.1.x&branchB=release/1.21')
  .expectBadge({
    label: 'commits difference',
    message: isMetric,
    color: 'blue',
  })

t.create('Commits difference - correct, between tags')
  .get('/microsoft/vscode.json?branchA=1.58.0&branchB=1.59.0')
  .expectBadge({
    label: 'commits difference',
    message: isMetric,
    color: 'blue',
  })

t.create('Commits difference - correct, between commits')
  .get('/microsoft/vscode.json?branchA=3d82ef7&branchB=82f2db7')
  .expectBadge({
    label: 'commits difference',
    message: isMetric,
    color: 'blue',
  })

t.create('Commits difference - incorrect, between commits')
  .get('/microsoft/vscode.json?branchA=fffffff&branchB=82f2db7')
  .expectBadge({
    label: 'commits difference',
    message:
      'could not establish commit difference between branches/tags/commits',
    color: 'red',
  })

t.create('Commits difference - incorrect, missing branchB')
  .get('/microsoft/vscode.json?branchA=fffffff')
  .expectBadge({
    label: 'commits difference',
    message: 'invalid query parameter: branchB',
    color: 'red',
  })
