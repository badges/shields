import {ServiceTester} from '../tester.js';

const t = new ServiceTester({ id: 'versioneye', title: 'VersionEye' })
export default t;

t.create('no longer available (previously dependencies status)')
  .get('/d/ruby/rails.json')
  .expectBadge({
    label: 'versioneye',
    message: 'no longer available',
  })
