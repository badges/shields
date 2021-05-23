const t = (function() {
  export default __a;
}())
import {withRegex} from '../test-validators.js';
import {sampleProjectUuid, noSymfonyToken} from './symfony-test-helpers.js';

t.create('valid project stars')
  .skipWhen(noSymfonyToken)
  .get(`/${sampleProjectUuid}.json`)
  .timeout(15000)
  .expectBadge({
    label: 'stars',
    message: withRegex(
      /^(?=.{4}$)(\u2605{0,4}[\u00BC\u00BD\u00BE]?\u2606{0,4})$/
    ),
  })

t.create('stars: nonexistent project')
  .skipWhen(noSymfonyToken)
  .get('/abc.json')
  .expectBadge({
    label: 'symfony insight',
    message: 'project not found',
  })
