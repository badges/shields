import { createServiceTester } from '../tester.js'
import { isFormattedDate } from '../test-validators.js'
export const t = await createServiceTester()

t.create('release date invalid extension')
  .get('/release-date/badges/shields.json')
  .expectBadge({
    label: 'release date',
    message: 'extension not found',
  })

t.create('release date').get('/release-date/redhat/java.json').expectBadge({
  label: 'release date',
  message: isFormattedDate,
})
