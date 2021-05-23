import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('license')
  .get('/libc.json')
  .expectBadge({ label: 'license', message: 'MIT OR Apache-2.0' })

t.create('license (with version)')
  .get('/libc/0.2.44.json')
  .expectBadge({ label: 'license', message: 'MIT OR Apache-2.0' })

t.create('license (not found)')
  .get('/not-a-real-package.json')
  .expectBadge({ label: 'crates.io', message: 'not found' })
