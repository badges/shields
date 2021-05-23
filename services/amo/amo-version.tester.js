import {isVPlusDottedVersionAtLeastOne} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('Version').get('/IndieGala-Helper.json').expectBadge({
  label: 'mozilla add-on',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Version (not found)')
  .get('/not-a-real-plugin.json')
  .expectBadge({ label: 'mozilla add-on', message: 'not found' })
