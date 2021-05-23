import {isSemver} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('module version').get('/camptocamp/openssl.json').expectBadge({
  label: 'puppetforge',
  message: isSemver,
})

t.create('module version (not found)')
  .get('/notarealuser/notarealpackage.json')
  .expectBadge({
    label: 'puppetforge',
    message: 'not found',
  })
