'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Project Status')
  .get('/kubernetes/31.json')
  .expectBadge({
    label: 'Licensing',
    message: 'Closed',
    color: 'green',
    link: ['https://github.com/orgs/kubernetes/projects/31/'],
  })
