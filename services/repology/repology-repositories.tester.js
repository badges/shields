'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { nonNegativeInteger } = require('../validators')
const { projectWithTwentyRepositories } = require('./repology-test-helpers')

t.create('Existing project')
  .get('/starship.json')
  .expectBadge({
    label: 'in repositories',
    message: nonNegativeInteger,
  })

t.create('Non-existent project')
  .get('/invalidprojectthatshouldnotexist.json')
  .expectBadge({
    label: 'in repositories',
    message: 0,
  })

t.create('Project with repositories')
  .get('/starship.json')
  .intercept(nock =>
    nock('https://repology.org/badge/tiny-repos')
      .get('/starship.svg')
      .reply(200, projectWithTwentyRepositories)
  )
  .expectBadge({
    label: 'in repositories',
    message: '20',
    color: 'blue',
  })
