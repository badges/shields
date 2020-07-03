'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Coverage').get('/gitlab-org/gitlab-runner.json').expectBadge({
  label: 'coverage',
  message: isIntegerPercentage,
})

t.create('Coverage (branch)')
  .get('/gitlab-org/gitlab-runner/12-0-stable.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage (existent branch but coverage not set up)')
  .get('/gitlab-org/gitlab/master.json')
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
  .get('/this-repo/does-not-exist.json')
  .expectBadge({
    label: 'coverage',
    message: 'inaccessible',
  })

t.create('Coverage (custom gitlab URL)')
  .get('/GNOME/libhandy.json?gitlab_url=https://gitlab.gnome.org')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })
