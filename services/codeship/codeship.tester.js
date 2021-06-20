import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('codeship (valid, no branch)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('codeship (valid, with branch)')
  .get('/0bdb0440-3af5-0133-00ea-0ebda3a33bf6/master.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('codeship (repo not found)')
  .get('/not-a-repo.json')
  .expectBadge({ label: 'build', message: 'project not found' })

t.create('codeship (branch not found)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/not-a-branch.json')
  .expectBadge({ label: 'build', message: 'branch not found' })
