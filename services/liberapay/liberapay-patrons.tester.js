import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('Patrons (valid)').get('/Liberapay.json').expectBadge({
  label: 'patrons',
  message: isMetric,
})

t.create('Patrons (not found)')
  .get('/does-not-exist.json')
  .expectBadge({ label: 'liberapay', message: 'not found' })
