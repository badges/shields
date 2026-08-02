import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('github pull request check state')
  // The GitHub API stops returning data for PRs than are more than ~15 months old. Update to the latest opened PR when this happens.
  .get('/s/pulls/badges/shields/12083.json')
  .expectBadge({ label: 'checks', message: 'success' })

t.create('github pull request check state (pull request not found)')
  .get('/s/pulls/badges/shields/5101.json')
  .expectBadge({ label: 'checks', message: 'pull request or repo not found' })

t.create(
  "github pull request check state (ref returned by github doesn't exist)",
)
  .get('/s/pulls/badges/shields/1110.json')
  .intercept(
    nock =>
      nock('https://api.github.com', { allowUnmocked: true })
        .get('/repos/badges/shields/pulls/1110')
        .reply(200, JSON.stringify({ head: { sha: 'abcde12356' } })), // Looks like a real ref, but isn't.
  )
  .networkOn()
  .expectBadge({
    label: 'checks',
    message: 'commit not found',
  })

t.create('github pull request check contexts')
  // The GitHub API stops returning data for PRs than are more than ~15 months old. Update to the latest opened PR when this happens.
  .get('/contexts/pulls/badges/shields/12083.json')
  .expectBadge({ label: 'checks', message: '1 success' })
