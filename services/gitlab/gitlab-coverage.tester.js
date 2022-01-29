import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Coverage (branch)')
  .get('/gitlab-org/gitlab-runner/12-0-stable.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage (existent branch but coverage not set up)')
  .get('/gitlab-org/gitlab-git-http-server/master.json')
  .expectBadge({
    label: 'coverage',
    message: 'not set up',
  })

t.create('Coverage (nonexistent branch)')
  .get('/gitlab-org/gitlab-runner/nope-not-a-branch.json')
  .expectBadge({
    label: 'coverage',
    message: 'not set up',
  })

t.create('Coverage (nonexistent repo)')
  .get('/this-repo/does-not-exist/neither-branch.json')
  .expectBadge({
    label: 'coverage',
    message: 'inaccessible',
  })

t.create('Coverage (custom job)')
  .get(
    '/gitlab-org/gitlab-runner/12-0-stable.json?job_name=test coverage report'
  )
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage (custom invalid job)')
  .get('/gitlab-org/gitlab-runner/12-0-stable.json?job_name=i dont exist')
  .expectBadge({
    label: 'coverage',
    message: 'not set up',
  })

t.create('Coverage (custom gitlab URL)')
  .get('/GNOME/at-spi2-core/master.json?gitlab_url=https://gitlab.gnome.org')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage (custom gitlab URL and job)')
  .get(
    '/GNOME/libhandy/master.json?gitlab_url=https://gitlab.gnome.org&job_name=unit-test'
  )
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })
