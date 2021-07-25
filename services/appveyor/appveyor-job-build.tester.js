import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Job CI status')
  .timeout(10000)
  .get('/wpmgprostotema/voicetranscoder/Windows.json')
  .expectBadge({ label: 'build', message: isBuildStatus })

t.create('Job CI status on branch')
  .timeout(10000)
  .get('/wpmgprostotema/voicetranscoder/Linux/master.json')
  .expectBadge({ label: 'build', message: isBuildStatus })

t.create('Job CI status on nonexistent project')
  .timeout(10000)
  .get('/somerandomproject/thatdoesntexist/foo.json')
  .expectBadge({
    label: 'build',
    message: 'project not found or access denied',
  })
