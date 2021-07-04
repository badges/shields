import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Translations')
  .get('/nijel/translations.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'translations', message: isMetric })

t.create('Suggestions')
  .get('/nijel/suggestions.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'suggestions', message: isMetric })

t.create('Languages')
  .get('/nijel/languages.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'languages', message: isMetric })
