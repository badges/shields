import {nonNegativeInteger} from '../validators.js';
const t = (function() {
  export default __a;
}())

t.create('quality score (valid)')
  .get('/432.json')
  .expectBadge({ label: 'quality', message: nonNegativeInteger })

t.create('quality score (project not found)')
  .get('/0101.json')
  .expectBadge({ label: 'quality', message: 'not found' })

t.create('quality score (no score available)')
  .get('/2504.json')
  .expectBadge({ label: 'quality', message: 'no score available' })
