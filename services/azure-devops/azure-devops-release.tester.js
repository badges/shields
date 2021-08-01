import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// https://dev.azure.com/totodem/Shields.io is a public Azure DevOps project
// solely created for Shields.io testing.

t.create('release status is succeeded')
  .get('/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/1/1.json')
  .expectBadge({
    label: 'deployment',
    message: isBuildStatus,
  })

t.create('never deployed')
  .get('/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/1/4.json')
  .expectBadge({
    label: 'deployment',
    message: 'never deployed',
  })

t.create('unknown environment')
  .get('/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/1/515.json')
  .expectBadge({
    label: 'deployment',
    message: 'user or environment not found',
  })

t.create('unknown definition')
  .get('/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/515/515.json')
  .expectBadge({
    label: 'deployment',
    message: 'inaccessible or definition not found',
  })

t.create('unknown project')
  .get('/totodem/515/515/515.json')
  .expectBadge({ label: 'deployment', message: 'project not found' })

t.create('unknown user').get('/this-repo/does-not-exist/1/2.json').expectBadge({
  label: 'deployment',
  message: 'user or environment not found',
})
