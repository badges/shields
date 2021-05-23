const t = (function() {
  export default __a;
}())
import {isMetric} from '../test-validators.js';

t.create('Contributors').get('/contributors/badges/shields.json').expectBadge({
  label: 'contributors',
  message: isMetric,
})

t.create('1 contributor')
  .get('/contributors/badges/shields-tests.json')
  .expectBadge({
    label: 'contributors',
    message: '1',
  })

t.create('Contributors (repo not found)')
  .get('/contributors/badges/helmets.json')
  .expectBadge({
    label: 'contributors',
    message: 'repo not found',
  })
