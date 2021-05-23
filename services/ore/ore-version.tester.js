import {isVPlusDottedVersionAtLeastOne} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('Nucleus (pluginId nucleus)').get('/nucleus.json').expectBadge({
  label: 'version',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'version',
  message: 'not found',
})
