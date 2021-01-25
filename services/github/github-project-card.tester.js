'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Project Card Status (Columns)')
  .get('/kubernetes/31/cards/columns.json')
  .expectBadge({
    label: 'Licensing',
    message:
      'Backlog: 0, To do: 0, In progress: 0, Review in progress: 0, Done: 11, Done (1.17): 2',
    color: 'brightgreen',
    link: ['https://github.com/orgs/kubernetes/projects/31/'],
  })

t.create('Project Card Status (Purpose)')
  .get('/kubernetes/31/cards/purpose.json')
  .expectBadge({
    label: 'Licensing',
    message: 'Todo: 0, In Progress: 0, Done: 13',
    color: 'brightgreen',
    link: ['https://github.com/orgs/kubernetes/projects/31/'],
  })
