'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../../lib/build-status')

const t = (module.exports = require('../create-service-tester')())

t.create('Pipeline status')
  .get('/gitlab-org/gitlab-ce.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('Pipeline status (branch)')
  .get('/gitlab-org/gitlab-ce/v10.7.6.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('Pipeline status (nonexistent branch)')
  .get('/gitlab-org/gitlab-ce/nope-not-a-branch.json')
  .expectJSON({
    name: 'build',
    value: 'branch not found',
  })

t.create('Pipeline status (nonexistent repo)')
  .get('/this-repo/does-not-exist.json')
  .expectJSON({
    name: 'build',
    value: 'repo not found',
  })

t.create('Pipeline status (custom gitlab URL)')
  .get('/GNOME/pango.json?gitlab_url=https://gitlab.gnome.org')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )
