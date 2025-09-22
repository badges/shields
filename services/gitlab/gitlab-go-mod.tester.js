import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const user = 'gitlab-org'
const repo = 'gitlab-runner'

t.create('go version in root')
  .get(`/${user}/${repo}.json`)
  .expectBadge({ label: 'Go', message: isVPlusDottedVersionAtLeastOne })

t.create('go version in root (branch)')
  .get(`/${user}/${repo}/main.json`)
  .expectBadge({ label: 'Go@main', message: isVPlusDottedVersionAtLeastOne })

t.create('project not found')
  .get('/some-project/that-doesnt-exist.json')
  .expectBadge({ label: 'Go', message: 'project or file not found' })

t.create('go version in subdirectory')
  .get(`/${user}/${repo}/main.json?filename=helpers/runner_wrapper/api/go.mod`)
  .expectBadge({
    label: 'Go@main',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('file not found')
  .get(`/${user}/${repo}/main.json?filename=nonexistent/go.mod`)
  .expectBadge({ label: 'Go', message: 'project or file not found' })
