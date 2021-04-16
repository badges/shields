'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Tag (latest by date)')
  .get('/fdroid/fdroidclient.json')
  .expectBadge({ label: 'tag', message: Joi.string(), color: 'blue' })

t.create('Tag (no tags)')
  .get('/fdroid/fdroiddata.json')
  .expectBadge({ label: 'tag', message: 'no tags found' })
