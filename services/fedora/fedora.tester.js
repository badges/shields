import { isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Fedora package (default branch, valid)')
  .get('/rpm.json')
  .expectBadge({
    label: 'fedora',
    message: isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
  })

t.create('Fedora package (package not found)')
  .get('/not-a-package/rawhide.json')
  .expectBadge({ label: 'fedora', message: 'branch or package not found' })

t.create('Fedora package (branch not found)')
  .get('/not-a-package/not-a-branch.json')
  .expectBadge({ label: 'fedora', message: 'branch or package not found' })
