import {isMetric} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('module downloads').get('/camptocamp/openssl.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('module downloads (not found)')
  .get('/notarealuser/notarealpackage.json')
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })
