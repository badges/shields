'use strict'

const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Pipeline status')
  .get('/gitlab-org/gitlab-ce.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('Pipeline status (branch)')
  .get('/gitlab-org/gitlab-ce/v10.7.6.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('Pipeline status (nonexistent branch)')
  .get('/gitlab-org/gitlab-ce/nope-not-a-branch.json')
  .expectBadge({
    label: 'build',
    message: 'branch not found',
  })

t.create('Pipeline status (nonexistent repo)')
  .get('/this-repo/does-not-exist.json')
  .expectBadge({
    label: 'build',
    message: 'repo not found',
  })

t.create('Pipeline status (custom gitlab URL)')
  .get('/GNOME/pango.json?gitlab_url=https://gitlab.gnome.org')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })
