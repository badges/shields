import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('JavaScript Questions')
  .get('/stackoverflow/t/javascript.json')
  .expectBadge({
    label: 'stackoverflow javascript questions',
    message: isMetric,
  })

t.create('Tex Programming Questions')
  .get('/tex/t/programming.json')
  .expectBadge({
    label: 'tex programming questions',
    message: isMetric,
  })
