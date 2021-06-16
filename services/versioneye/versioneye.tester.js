import {ServiceTester} from '../tester.js';

export const t = new ServiceTester({ id: 'versioneye', title: 'VersionEye' })

t.create('no longer available (previously dependencies status)')
  .get('/d/ruby/rails.json')
  .expectBadge({
    label: 'versioneye',
    message: 'no longer available',
  })
