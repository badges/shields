const t = (function() {
  export default __a;
}())
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
