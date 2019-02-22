'use strict'

const Joi = require('joi')
const { withRegex } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

// Matches API responses such as "0 projects", "1 projects", "182 projects", "14.0k projects".
// There may be other cases not covered by this regex, but hopefully the tested projects won't vary much.
const projectsCount = withRegex(/^[0-9]*(\.[0-9]k)?\sprojects$/)

t.create('project usage count')
  .get('/github.com/theupdateframework/notary.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'used by',
      value: projectsCount,
    })
  )

t.create('project without any available information')
  .get('/github.com/PyvesB/EmptyRepo.json')
  .expectJSON({
    name: 'used by',
    value: '0 projects',
  })
