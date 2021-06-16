import {createServiceTester} from '../tester.js'
export const t = await createServiceTester()
import {isFormattedDate} from '../test-validators.js';

t.create('date')
  .get('/visual-studio-marketplace/last-updated/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('invalid extension id')
  .get('/visual-studio-marketplace/last-updated/yasht-terminal-all-in-one.json')
  .expectBadge({
    label: 'last updated',
    message: 'invalid extension id',
  })

t.create('non existent extension')
  .get(
    '/visual-studio-marketplace/last-updated/yasht.terminal-all-in-one-fake.json'
  )
  .expectBadge({
    label: 'last updated',
    message: 'extension not found',
  })
