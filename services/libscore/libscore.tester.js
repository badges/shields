import {ServiceTester} from '../tester.js';

const t = new ServiceTester({ id: 'libscore', title: 'libscore' })
export default t;

t.create('no longer available (previously usage statistics)')
  .get('/s/jQuery.json')
  .expectBadge({
    label: 'libscore',
    message: 'no longer available',
  })
