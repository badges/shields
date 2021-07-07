'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const isCommaSeparated = Joi.string().regex(
  /^(([><~]=?\d(?:\.\d)?(?:\.[*\d])?)(, )?)+$/
)

t.create('python requires (valid, package version specified)')
  .get('/requests/2.24.0')
  .expectBadge({
    label: 'python',
    message: '>=2.7, !=3.0.*, !=3.1.*, !=3.2.*, !=3.3.*, !=3.4.*',
  })

t.create('python requires (valid, package version not specified)')
  .get('/requests.json')
  .expectBadge({
    label: 'python',
    message: isCommaSeparated,
  })

t.create('python requires (Only only)')
  .get('/discord.py/1.4.1.json')
  .expectBadge({
    label: 'python',
    message: '>=3.5.3',
  })

t.create('python requires (invalid)').get('/not-a-package.json').expectBadge({
  label: 'python',
  message: 'missing',
})
