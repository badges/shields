import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('dependent count').timeout(10000).get('/npm/got.json').expectBadge({
  label: 'dependents',
  message: isMetric,
})

t.create('dependent count (scoped npm package)')
  .timeout(10000)
  .get('/npm/@babel/core.json')
  .expectBadge({
    label: 'dependents',
    message: isMetric,
  })

t.create('dependent count (nonexistent package)')
  .timeout(10000)
  .get('/npm/foobar-is-not-package.json')
  .expectBadge({
    label: 'dependents',
    message: 'package not found',
  })
