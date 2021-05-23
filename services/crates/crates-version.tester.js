import {isSemver} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('version')
  .get('/libc.json')
  .expectBadge({ label: 'crates.io', message: isSemver })

t.create('version (not found)')
  .get('/not-a-real-package.json')
  .expectBadge({ label: 'crates.io', message: 'not found' })
