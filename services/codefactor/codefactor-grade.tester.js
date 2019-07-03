'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())
const { letterGrades } = require('./codefactor-helpers')
const codeFactorGrade = Joi.allow(...Object.keys(letterGrades))

t.create('Grade')
  .get('/github/google/guava.json')
  .expectBadge({
    label: 'code quality',
    message: codeFactorGrade,
  })

t.create('Grade (branch)')
  .get('/github/pallets/flask/master.json')
  .expectBadge({
    label: 'code quality',
    message: codeFactorGrade,
  })

t.create('Grade (nonexistent repo)')
  .get('/github/badges/asdfasdfasdfasdfasfae.json')
  .expectBadge({
    label: 'code quality',
    message: 'repo or branch not found',
  })
