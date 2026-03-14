import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// https://app.codacy.com/gh/schemacrawler/SchemaCrawler/dashboard
// https://github.com/schemacrawler/SchemaCrawler
t.create('Coverage').get('/84c0a068ce9349f2bcaa07b5977bd932.json').expectBadge({
  label: 'coverage',
  message: isIntegerPercentage,
})

t.create('Coverage on branch')
  .get('/84c0a068ce9349f2bcaa07b5977bd932/main.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage not enabled')
  .get('/1cc53e72c9fa4d87be03d6085451cb2c.json')
  .expectBadge({
    label: 'coverage',
    message: 'not enabled for this project',
  })

t.create('Coverage (project not found)')
  .get('/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.json')
  .expectBadge({
    label: 'coverage',
    message: 'project not found',
  })
