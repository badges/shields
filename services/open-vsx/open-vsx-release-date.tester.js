import {createServiceTester} from '../tester.js'
export const t = await createServiceTester()
import {isFormattedDate} from '../test-validators.js';

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
