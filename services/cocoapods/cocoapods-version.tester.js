import {isVPlusDottedVersionAtLeastOne} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('version (valid)').get('/AFNetworking.json').expectBadge({
  label: 'pod',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'pod', message: 'not found' })
