'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../build-status')
const { ServiceTester } = require('../tester')
const { isIntegerPercentage } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'scrutinizer',
  title: 'Scrutinizer',
}))

t.create('code quality')
  .get('/g/filp/whoops.json')
  .expectBadge({
    label: 'code quality',
    message: Joi.number().positive(),
  })

t.create('code quality (branch)')
  .get('/g/phpmyadmin/phpmyadmin/master.json')
  .expectBadge({
    label: 'code quality',
    message: Joi.number().positive(),
  })

t.create('code coverage')
  .get('/coverage/g/filp/whoops.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('code coverage (branch)')
  .get('/coverage/g/PHPMailer/PHPMailer/master.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('build')
  .get('/build/g/filp/whoops.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('build (branch)')
  .get('/build/g/phpmyadmin/phpmyadmin/master.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('project not found')
  .get('/build/g/does-not-exist/does-not-exist.json')
  .expectBadge({
    label: 'build',
    message: 'project or branch not found',
  })

t.create('code coverage unknown')
  .get('/coverage/g/phpmyadmin/phpmyadmin/master.json')
  .expectBadge({
    label: 'coverage',
    message: 'unknown',
  })

t.create('unexpected response data')
  .get('/coverage/g/filp/whoops.json')
  .intercept(nock =>
    nock('https://scrutinizer-ci.com')
      .get('/api/repositories/g/filp/whoops')
      .reply(200, '{"unexpected":"data"}')
  )
  .expectBadge({
    label: 'coverage',
    message: 'invalid',
  })

t.create('build - unknown')
  .get('/build/g/filp/whoops.json?style=_shields_test')
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
