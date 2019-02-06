'use strict'

const Joi = require('joi')
const { isFormattedDate } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('last commit (recent)')
  .get('/eslint/eslint.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'last commit', value: isFormattedDate })
  )

t.create('last commit (ancient)')
  .get('/badges/badgr.co.json')
  .expectJSON({ name: 'last commit', value: 'january 2014' })

t.create('last commit (on branch)')
  .get('/badges/badgr.co/shielded.json')
  .expectJSON({ name: 'last commit', value: 'july 2013' })

t.create('last commit (repo not found)')
  .get('/badges/helmets.json')
  .expectJSON({ name: 'last commit', value: 'repo not found' })
