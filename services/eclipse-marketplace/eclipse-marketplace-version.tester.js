import {isVPlusDottedVersionAtLeastOne} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('marketplace version').get('/notepad4e.json').expectBadge({
  label: 'eclipse marketplace',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('last update for unknown solution')
  .get('/this-does-not-exist.json')
  .expectBadge({
    label: 'eclipse marketplace',
    message: 'solution not found',
  })
