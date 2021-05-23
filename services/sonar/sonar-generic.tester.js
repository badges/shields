import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('Security Rating')
  .timeout(10000)
  .get(
    '/security_rating/com.luckybox:luckybox.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'security rating',
    message: isMetric,
    color: 'blue',
  })
