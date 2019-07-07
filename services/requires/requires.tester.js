'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const isRequireStatus = Joi.string().regex(
  /^(up to date|outdated|insecure|unknown)$/
)

t.create('requirements (valid, without branch)')
  .get('/github/celery/celery.json')
  .expectBadge({
    label: 'requirements',
    message: isRequireStatus,
  })

t.create('requirements (valid, with branch)')
  .get('/github/celery/celery/master.json')
  .expectBadge({
    label: 'requirements',
    message: isRequireStatus,
  })

t.create('requirements (not found)')
  .get('/github/PyvesB/EmptyRepo.json')
  .expectBadge({ label: 'requirements', message: 'not found' })
