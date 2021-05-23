import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('clojars downloads (valid)').get('/prismic.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('clojars downloads (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
