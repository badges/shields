import Joi from 'joi';
const t = (function() {
  export default __a;
}())
import {isMetric} from '../test-validators.js';
const isMetricAllowZero = Joi.alternatives(
  isMetric,
  Joi.number().valid(0).required()
)

t.create('Total')
  .get('/total/swellaby/swellaby:testspace-sample/main.json')
  .expectBadge({
    label: 'total tests',
    message: isMetricAllowZero,
  })

t.create('Passed')
  .get('/passed/swellaby/swellaby:testspace-sample/main.json')
  .expectBadge({
    label: 'passed tests',
    message: isMetricAllowZero,
  })

t.create('Failed')
  .get('/failed/swellaby/swellaby:testspace-sample/main.json')
  .expectBadge({
    label: 'failed tests',
    message: isMetricAllowZero,
  })

t.create('Skipped')
  .get('/skipped/swellaby/swellaby:testspace-sample/main.json')
  .expectBadge({
    label: 'skipped tests',
    message: isMetricAllowZero,
  })

t.create('Errored')
  .get('/errored/swellaby/swellaby:testspace-sample/main.json')
  .expectBadge({
    label: 'errored tests',
    message: isMetricAllowZero,
  })
