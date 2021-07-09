import { ServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = new ServiceTester({
  id: 'WeblateUserStatistic',
  title: 'Weblate User Statistic',
  pathPrefix: '/weblate',
})

t.create('Translations')
  .get('/user/nijel/translations.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'translations', message: isMetric })

t.create('Suggestions')
  .get('/user/nijel/suggestions.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'suggestions', message: isMetric })

t.create('Languages')
  .get('/user/nijel/languages.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'languages', message: isMetric })
