'use strict'

const Joi = require('joi')
const { codacyGrade } = require('./codacy-helpers')

const t = (module.exports = require('../create-service-tester')())

t.create('Code quality')
  .get('/grade/e27821fb6289410b8f58338c7e0bc686.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'code quality',
      value: codacyGrade,
    })
  )

t.create('Code quality on branch')
  .get('/grade/e27821fb6289410b8f58338c7e0bc686/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'code quality',
      value: codacyGrade,
    })
  )

t.create('Code quality (package not found)')
  .get('/grade/00000000000000000000000000000000/master.json')
  .expectJSON({
    name: 'code quality',
    value: 'project or branch not found',
  })

// This is a known bug. The badge endpoint for a nonexistent branch returns
// the same result. It seems possible the branch specification isn't being
// considered at all.
// e.g.
// https://api.codacy.com/project/badge/grade/e27821fb6289410b8f58338c7e0bc686
// https://api.codacy.com/project/badge/grade/e27821fb6289410b8f58338c7e0bc686?branch=foo
// t.create('Code quality on branch (branch not found)')
//   .get('/grade/e27821fb6289410b8f58338c7e0bc686/not-a-branch.json')
//   .expectJSON({
//       name: 'code quality',
//       value: 'project or branch not found',
//   })
