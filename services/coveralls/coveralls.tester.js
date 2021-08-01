import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('github coverage')
  .get('/github/jekyll/jekyll.json')
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('nonexistent project')
  .get('/github/fake-shields-io/not-a-real-repository.json')
  .expectBadge({ label: 'coverage', message: 'repository not found' })

t.create('github branch coverage')
  .get('/github/lemurheavy/coveralls-ruby/master.json')
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('bitbucket coverage')
  .get('/bitbucket/pyKLIP/pyklip.json')
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })
