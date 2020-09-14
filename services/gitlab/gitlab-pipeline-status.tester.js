'use strict'

const { isBuildStatus } = require('../build-status')
const { ServiceTester } = require('../tester')
const t = (module.exports = new ServiceTester({
  id: 'GitlabPipeline',
  title: 'Gitlab Pipeline',
  pathPrefix: '/gitlab/pipeline',
}))

t.create('Pipeline status').get('/gitlab-org/gitlab/v10.7.6.json').expectBadge({
  label: 'build',
  message: isBuildStatus,
})

t.create('Pipeline status (nonexistent branch)')
  .get('/gitlab-org/gitlab/nope-not-a-branch.json')
  .expectBadge({
    label: 'build',
    message: 'branch not found',
  })

t.create('Pipeline status (nonexistent repo)')
  .get('/this-repo/does-not-exist/master.json')
  .expectBadge({
    label: 'build',
    message: 'inaccessible',
  })

t.create('Pipeline status (custom gitlab URL)')
  .get('/GNOME/pango/master.json?gitlab_url=https://gitlab.gnome.org')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('Pipeline no branch redirect')
  .get('/gitlab-org/gitlab.svg')
  .expectRedirect('/gitlab/pipeline/gitlab-org/gitlab/master.svg')
