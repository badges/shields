import {ServiceTester} from '../tester.js';
import {isVPlusDottedVersionAtLeastOne} from '../test-validators.js';

const t = (function() {
  export default __a;
}())

t.create('Plugin Version').get('/plugin/v/akismet.json').expectBadge({
  label: 'plugin',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Theme Version').get('/theme/v/twentyseventeen.json').expectBadge({
  label: 'theme',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Plugin Version | Not Found').get('/plugin/v/100.json').expectBadge({
  label: 'plugin',
  message: 'not found',
})

t.create('Theme Version | Not Found').get('/theme/v/100.json').expectBadge({
  label: 'theme',
  message: 'not found',
})
