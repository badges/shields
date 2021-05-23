import {isSemver} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('gets the package version of elm/core')
  .get('/elm/core.json')
  .expectBadge({ label: 'elm package', message: isSemver })

t.create('invalid package name')
  .get('/elm-community/frodo-is-not-a-package.json')
  .expectBadge({ label: 'elm package', message: 'package not found' })
