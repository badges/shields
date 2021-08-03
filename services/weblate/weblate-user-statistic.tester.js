import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Translations')
  .get('/translations/nijel.json')
  .expectBadge({ label: 'translations', message: isMetric })

t.create('Suggestions')
  .get('/suggestions/nijel.json')
  .expectBadge({ label: 'suggestions', message: isMetric })

t.create('Languages')
  .get('/languages/nijel.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'languages', message: isMetric })
