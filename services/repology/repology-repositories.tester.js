const t = (function() {
  export default __a;
}())
import {nonNegativeInteger} from '../validators.js';

t.create('Existing project').get('/starship.json').expectBadge({
  label: 'repositories',
  message: nonNegativeInteger,
})

t.create('Non-existent project')
  .get('/invalidprojectthatshouldnotexist.json')
  .expectBadge({
    label: 'repositories',
    message: '0',
  })
