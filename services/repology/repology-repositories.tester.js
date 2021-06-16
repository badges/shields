import {createServiceTester} from '../tester.js'
export const t = await createServiceTester()
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
