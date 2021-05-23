import {isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('Fedora package (default branch, valid)')
  .get('/rpm.json')
  .expectBadge({
    label: 'fedora',
    message: isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
  })

t.create('Fedora package (not found)')
  .get('/not-a-package/rawhide.json')
  .expectBadge({ label: 'fedora', message: 'not found' })

t.create('Fedora package (branch not found)')
  .get('/not-a-package/not-a-branch.json')
  .expectBadge({ label: 'fedora', message: 'branch not found' })
