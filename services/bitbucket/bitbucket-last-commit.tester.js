import { isFormattedDate } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'BitbucketLastCommit',
  title: 'Bitbucket last commit',
  pathPrefix: '/bitbucket/last-commit',
})

t.create('last commit')
  .get('/shields-io/test-repo/main.json')
  .expectBadge({ label: 'last commit', message: isFormattedDate })

t.create('last commit (path)')
  .get('/shields-io/test-repo/main.json?path=README.md')
  .expectBadge({ label: 'last commit', message: isFormattedDate })

t.create('last commit (user not found)')
  .get('/not-a-user/test-repo/main.json')
  .expectBadge({
    label: 'last commit',
    message: 'user, repo or branch not found',
  })

t.create('last commit (repo not found)')
  .get('/shields-io/not-a-repo/main.json')
  .expectBadge({
    label: 'last commit',
    message: 'user, repo or branch not found',
  })

t.create('last commit (branch not found)')
  .get('/shields-io/test-repo/not-a-branch.json')
  .expectBadge({
    label: 'last commit',
    message: 'user, repo or branch not found',
  })

t.create('last commit (path not found)')
  .get('/shields-io/test-repo/main.json?path=not/a/dir')
  .expectBadge({ label: 'last commit', message: 'no commits found' })
