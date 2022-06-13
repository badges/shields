import { ServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'OpenUserJSIssues',
  title: 'OpenUserJS Issues',
  pathPrefix: '/openuserjs',
})

t.create('Issues')
  .get('/issues/MAX30/TopAndDownButtonsEverywhere.json')
  .expectBadge({ label: 'issues', message: isMetric })

t.create('Issues (not found)')
  .get('/issues/NotAUser/NotAScript.json')
  .expectBadge({ label: 'issues', message: 'invalid' })
