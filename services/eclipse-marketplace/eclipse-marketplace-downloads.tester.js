import {ServiceTester} from '../tester.js';
import {isMetric, isMetricOverTimePeriod} from '../test-validators.js';

const t = (function() {
  export default __a;
}())

t.create('total marketplace downloads').get('/dt/notepad4e.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('monthly marketplace downloads')
  .get('/dm/notepad4e.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('downloads for unknown solution')
  .get('/dt/this-does-not-exist.json')
  .expectBadge({
    label: 'downloads',
    message: 'solution not found',
  })
