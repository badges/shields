'use strict'

const Joi = require('@hapi/joi')
const { ServiceTester } = require('../tester')
const t = (module.exports = new ServiceTester({
  id: 'ScrutinizerQuality',
  title: 'ScrutinizerQuality',
  pathPrefix: '/scrutinizer/quality',
}))

const isQualityNumber = Joi.number().positive()

t.create('code quality (GitHub)')
  .get('/g/filp/whoops.json')
  .expectBadge({
    label: 'code quality',
    message: isQualityNumber,
  })

t.create('code quality branch (GitHub)')
  .get('/g/PHPMailer/PHPMailer/master.json')
  .expectBadge({
    label: 'code quality',
    message: isQualityNumber,
  })

t.create('code quality (Bitbucket)')
  .get('/b/atlassian/python-bitbucket.json')
  .expectBadge({
    label: 'code quality',
    message: isQualityNumber,
  })

t.create('code quality private project')
  .get('/gl/propertywindow/propertywindow/client.json')
  .expectBadge({
    label: 'code quality',
    message: 'not authorized to access project',
  })

t.create('code quality nonexistent project')
  .get('/gp/foo.json')
  .expectBadge({
    label: 'code quality',
    message: 'project not found',
  })
