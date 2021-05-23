import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('releases by user').get('/camptocamp.json').expectBadge({
  label: 'releases',
  message: isMetric,
})

t.create('releases by user').get('/not-a-real-user.json').expectBadge({
  label: 'releases',
  message: 'not found',
})
