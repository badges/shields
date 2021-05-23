const t = (function() {
  export default __a;
}())
import {isFormattedDate} from '../test-validators.js';

t.create('date')
  .get('/visual-studio-marketplace/release-date/yasht.terminal-all-in-one.json')
  .expectBadge({
    label: 'release date',
    message: isFormattedDate,
  })

t.create('invalid extension id')
  .get('/visual-studio-marketplace/release-date/yasht-terminal-all-in-one.json')
  .expectBadge({
    label: 'release date',
    message: 'invalid extension id',
  })

t.create('non existent extension')
  .get(
    '/visual-studio-marketplace/release-date/yasht.terminal-all-in-one-fake.json'
  )
  .expectBadge({
    label: 'release date',
    message: 'extension not found',
  })
