'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('stryker (valid, without branch)')
  .get('/tiagoporto/gerador-validador-cpf.json')
  .expectBadge({ label: 'Mutation score', color: 'green', message: '93.4%' })

t.create('stryker (valid repo, valid branch)')
  .get('/tiagoporto/gerador-validador-cpf/main.json')
  .expectBadge({ label: 'Mutation score', color: 'green', message: '93.4%' })

t.create('stryker (valid repo, invalid branch)')
  .get('/tiagoporto/gerador-validador-cpf/not-a-real-branch.json')
  .expectBadge({
    label: 'Mutation score',
    color: 'lightgrey',

    message: 'unknown',
  })

t.create('stryker (invalid project)')
  .get('/tiago/not-a-real-project.json')
  .expectBadge({
    label: 'Mutation score',
    message: 'unknown',
    color: 'lightgrey',
  })
