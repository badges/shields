'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Criterion (improved)').get('/chmoder/credit_card.json').expectBadge({
  label: 'criterion',
  message: 'improved',
})

t.create('Criterion (regressed)').get('/chmoder/data_vault.json').expectBadge({
  label: 'criterion',
  message: 'regressed',
})

t.create('Criterion (not found)')
  .get('/chmoder/not-a-repo.json')
  .expectBadge({ label: 'criterion', message: 'no status found' })
