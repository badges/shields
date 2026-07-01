import { withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('GitHub Discussions (repo not found)')
  .get('/not-a-user/not-a-repo.json')
  .expectBadge({ label: 'discussions', message: 'repo not found' })

const numberSpaceTotal = withRegex(/^\d+ total$/)
const numberSpaceAnswered = withRegex(/^\d+ answered$/)
const numberSpaceUnanswered = withRegex(/^\d+ unanswered$/)

t.create('GitHub Discussions (repo having discussions)')
  .get('/vercel/next.js.json')
  .expectBadge({ label: 'discussions', message: numberSpaceTotal })

t.create('GitHub Answered Discussions (repo having discussions)')
  .get('/vercel/next.js/answered.json')
  .expectBadge({ label: 'discussions', message: numberSpaceAnswered })

t.create('GitHub Unanswered Discussions (repo having discussions)')
  .get('/vercel/next.js/unanswered.json')
  .expectBadge({ label: 'discussions', message: numberSpaceUnanswered })
