import {isMetricOverTimePeriod} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('Monthly Questions for StackOverflow Momentjs')
  .get('/stackoverflow/qm/momentjs.json')
  .expectBadge({
    label: 'stackoverflow momentjs questions',
    message: isMetricOverTimePeriod,
  })

t.create('Monthly Questions for Tex Spacing')
  .get('/tex/qm/spacing.json')
  .expectBadge({
    label: 'tex spacing questions',
    message: isMetricOverTimePeriod,
  })
