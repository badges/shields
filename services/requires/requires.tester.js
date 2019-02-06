'use strict'

const Joi = require('joi')

const isRequireStatus = Joi.string().regex(
  /^(up to date|outdated|insecure|unknown)$/
)

const t = (module.exports = require('../tester').createServiceTester())

t.create('requirements (valid, without branch)')
  .get('/github/celery/celery.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'requirements',
      value: isRequireStatus,
    })
  )

t.create('requirements (valid, with branch)')
  .get('/github/celery/celery/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'requirements',
      value: isRequireStatus,
    })
  )

t.create('requirements (not found)')
  .get('/github/PyvesB/EmptyRepo.json')
  .expectJSON({ name: 'requirements', value: 'not found' })
