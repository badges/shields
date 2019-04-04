'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Scrutinizer build')
  .get('/g/filp/whoops.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('Scrutinizer build (branch)')
  .get('/g/phpmyadmin/phpmyadmin/master.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('build - unknown')
  .get('/g/filp/whoops.json?style=_shields_test')
  .intercept(nock =>
    nock('https://scrutinizer-ci.com')
      .get('/api/repositories/g/filp/whoops')
      .reply(200, {
        default_branch: 'master',
        applications: {
          master: {
            build_status: {
              status: 'unknown',
            },
          },
        },
      })
  )
  .expectBadge({
    label: 'build',
    message: 'unknown',
    color: 'lightgrey',
  })
