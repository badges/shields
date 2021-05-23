import {isVPlusDottedVersionAtLeastOne} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('iTunes version (valid)').get('/324684580.json').expectBadge({
  label: 'itunes app store',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('iTunes version (not found)')
  .get('/9.json')
  .expectBadge({ label: 'itunes app store', message: 'not found' })

t.create('iTunes version (invalid)')
  .get('/x.json')
  .expectBadge({ label: 'itunes app store', message: 'invalid' })
