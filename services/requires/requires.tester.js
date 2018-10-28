'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const isRequireStatus = Joi.string().regex(
  /^(up to date|outdated|insecure|unknown)$/
)

const t = createServiceTester()
module.exports = t

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
