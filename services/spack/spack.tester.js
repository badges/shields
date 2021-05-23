import {isVPlusDottedVersionAtLeastOne} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('version (valid)').get('/adios2.json').expectBadge({
  label: 'spack',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'spack', message: 'package not found' })
