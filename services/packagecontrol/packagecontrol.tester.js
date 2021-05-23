import {ServiceTester} from '../tester.js';
import {isMetric, isMetricOverTimePeriod} from '../test-validators.js';

const t = (function() {
  export default __a;
}())

t.create('monthly downloads').get('/dm/GitGutter.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('weekly downloads').get('/dw/GitGutter.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('daily downloads').get('/dd/GitGutter.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('total downloads').get('/dt/GitGutter.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('package not found').get('/dt/does-not-exist.json').expectBadge({
  label: 'downloads',
  message: 'not found',
})
