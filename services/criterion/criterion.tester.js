'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const {
  IMPROVED_STATUS,
  REGRESSED_STATUS,
  NOT_FOUND_STATUS,
} = require('./constants')

t.create('Criterion (improved)')
  .get('/chmoder/credit_card.json')
  .expectBadge({ label: 'criterion', message: IMPROVED_STATUS })

t.create('Criterion (regressed)')
  .get('/chmoder/data_vault.json')
  .expectBadge({ label: 'criterion', message: REGRESSED_STATUS })

t.create('Criterion (not found)')
  .get('/chmoder/not-a-repo.json')
  .expectBadge({ label: 'criterion', message: NOT_FOUND_STATUS })
