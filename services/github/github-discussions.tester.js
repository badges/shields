import { withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('GitHub Discussions (repo not found)')
  .get('/not-a-user/not-a-repo.json')
  .expectBadge({ label: 'discussions', message: 'repo not found' })

const numberSpaceTotal = withRegex(/^\d+ total$/)

t.create('GitHub Discussions (repo having discussions)')
  .get('/vercel/next.js.json')
  .expectBadge({ label: 'discussions', message: numberSpaceTotal })

t.create('GitHub Discussions all (repo having discussions)')
  .get('/all/vercel/next.js.json')
  .expectBadge({ label: 'discussions', message: numberSpaceTotal })

t.create('GitHub Answered Discussions (repo having discussions)')
  .get('/answered/vercel/next.js.json')
  .expectBadge({
    label: 'discussions',
    message: withRegex(/^\d+ answered$/),
  })

t.create('GitHub Unanswered Discussions (repo having discussions)')
  .get('/unanswered/vercel/next.js.json')
  .expectBadge({
    label: 'discussions',
    message: withRegex(/^\d+ unanswered$/),
  })
