import {ServiceTester} from '../tester.js';
import {isRelativeFormattedDate} from '../test-validators.js';

const t = (function() {
  export default __a;
}())

t.create('Relative date')
  .get('/1540814400.json')
  .expectBadge({ label: 'date', message: isRelativeFormattedDate })

t.create('Relative date - Invalid')
  .get('/9999999999999.json')
  .expectBadge({ label: 'date', message: 'invalid date' })
