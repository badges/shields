import { withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// Matches API responses such as "0 projects", "1 projects", "182 projects", "14.0k projects".
// There may be other cases not covered by this regex, but hopefully the tested projects won't vary much.
const projectsCount = withRegex(/^[0-9]*(\.[0-9]k)?\sprojects$/)

t.create('project usage count')
  .get('/github.com/theupdateframework/notary.json')
  .expectBadge({
    label: 'used by',
    message: projectsCount,
  })

t.create('project without any available information')
  .get('/github.com/badges/daily-tests.json')
  .expectBadge({
    label: 'used by',
    message: '0 projects',
  })
