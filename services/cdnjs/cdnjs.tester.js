import {isVPlusTripleDottedVersion} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('cdnjs (valid)').get('/jquery.json').expectBadge({
  label: 'cdnjs',
  message: isVPlusTripleDottedVersion,
})

t.create('cdnjs (not found)')
  .get('/not-a-library.json')
  .expectBadge({ label: 'cdnjs', message: 'not found' })
