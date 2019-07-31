'use strict'

const Joi = require('@hapi/joi')
const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Commits since')
  .get('/badges/shields/a0663d8da53fb712472c02665e6ff7547ba945b7.json')
  .expectBadge({
    label: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
    message: isMetric,
    color: 'blue',
  })

t.create('Commits since (branch)')
  .get('/badges/shields/60be4859585650e8c2b87669e3a39d98ca084e98/gh-pages.json')
  .expectBadge({
    label: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
    message: isMetric,
  })

t.create('Commits since by latest release')
  .get('/microsoft/typescript/latest.json')
  .expectBadge({
    label: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
    message: isMetric,
  })

t.create('Commits since by latest release (branch)')
  .get('/microsoft/typescript/latest/master.json')
  .expectBadge({
    label: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
    message: isMetric,
  })

t.create('Commits since (version not found)')
  .get('/badges/shields/not-a-version.json')
  .expectBadge({
    label: 'github',
    message: 'repo or version not found',
  })

t.create('Commits since (branch not found)')
  .get(
    '/badges/shields/a0663d8da53fb712472c02665e6ff7547ba945b7/not-a-branch.json'
  )
  .expectBadge({
    label: 'github',
    message: 'repo, branch or version not found',
  })
