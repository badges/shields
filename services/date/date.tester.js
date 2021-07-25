import { ServiceTester } from '../tester.js'
import { isRelativeFormattedDate } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'date',
  title: 'Relative Date Tests',
})

t.create('Relative date')
  .get('/1540814400.json')
  .expectBadge({ label: 'date', message: isRelativeFormattedDate })

t.create('Relative date - Invalid')
  .get('/9999999999999.json')
  .expectBadge({ label: 'date', message: 'invalid date' })
