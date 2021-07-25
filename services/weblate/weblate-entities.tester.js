import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Components')
  .get('/components.json')
  .expectBadge({ label: 'components', message: isMetric })

t.create('Projects')
  .get('/projects.json')
  .expectBadge({ label: 'projects', message: isMetric })

t.create('Users')
  .get('/users.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Components')
  .get('/components.json?server=https://translate.mattermost.com')
  .expectBadge({ label: 'components', message: isMetric })
