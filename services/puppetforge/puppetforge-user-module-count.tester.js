import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('modules by user').get('/camptocamp.json').expectBadge({
  label: 'modules',
  message: isMetric,
})

t.create('modules by user').get('/not-a-real-user.json').expectBadge({
  label: 'modules',
  message: 'not found',
})
