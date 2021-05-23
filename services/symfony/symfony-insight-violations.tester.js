const t = (function() {
  export default __a;
}())
import {withRegex} from '../test-validators.js';
import {sampleProjectUuid, noSymfonyToken} from './symfony-test-helpers.js';

t.create('valid project violations')
  .skipWhen(noSymfonyToken)
  .get(`/${sampleProjectUuid}.json`)
  .timeout(15000)
  .expectBadge({
    label: 'violations',
    message: withRegex(
      /0|\d* critical|\d* critical, \d* major|\d* critical, \d* major, \d* minor|\d* critical, \d* major, \d* minor, \d* info|\d* critical, \d* minor|\d* critical, \d* info|\d* major|\d* major, \d* minor|\d* major, \d* minor, \d* info|\d* major, \d* info|\d* minor|\d* minor, \d* info|\d* info/
    ),
  })
