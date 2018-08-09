'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isBuildStatus, isIntegerPercentage } = require('../test-validators')

const t = new ServiceTester({ id: 'scrutinizer', title: 'Scrutinizer' })
module.exports = t

t.create('code quality')
  .get('/g/filp/whoops.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'code quality',
      value: Joi.number().positive(),
    })
  )

t.create('code quality (branch)')
  .get('/g/phpmyadmin/phpmyadmin/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'code quality',
      value: Joi.number().positive(),
    })
  )

t.create('code coverage')
  .get('/coverage/g/filp/whoops.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('code coverage (branch)')
  .get('/coverage/g/doctrine/doctrine2/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('build')
  .get('/build/g/filp/whoops.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )

t.create('build (branch)')
  .get('/build/g/phpmyadmin/phpmyadmin/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )

t.create('project not found')
  .get('/build/g/does-not-exist/does-not-exist.json')
  .expectJSON({
    name: 'build',
    value: 'project or branch not found',
  })

t.create('code coverage unknown')
  .get('/coverage/g/phpmyadmin/phpmyadmin/master.json')
  .expectJSON({
    name: 'coverage',
    value: 'unknown',
  })

t.create('unexpected response data')
  .get('/coverage/g/filp/whoops.json')
  .intercept(nock =>
    nock('https://scrutinizer-ci.com')
      .get('/api/repositories/g/filp/whoops')
      .reply(200, '{"unexpected":"data"}')
  )
  .expectJSON({
    name: 'coverage',
    value: 'invalid',
  })
