import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('build (valid user project)')
  .get('/msuchy/nanoblogger/nanoblogger.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('build (valid group project)')
  .get('/%40copr/copr/copr-backend.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('build (openEuler server)')
  .get(
    '/mywaaagh_admin/i3wm/acpi.json?server=https://eur.openeuler.openatom.cn',
  )
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('build (not found)')
  .get('/not-a-user/not-a-project/not-a-package.json')
  .expectBadge({ label: 'build', message: 'project or package not found' })
