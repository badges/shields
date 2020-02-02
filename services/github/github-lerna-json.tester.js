'use strict'

const { isSemver } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Lerna version')
  .get('/babel/babel.json')
  .expectBadge({
    label: 'version',
    message: isSemver,
  })

t.create('Lerna version (independent)')
  .get('/jneander/jneander.json')
  .expectBadge({
    label: 'version',
    message: 'independent',
  })

t.create('Lerna version (branch)')
  .get('/babel/babel/master.json')
  .expectBadge({
    label: 'lerna@master',
    message: isSemver,
  })

t.create('Lerna version (lerna.json missing)')
  .get('/PyvesB/empty-repo.json')
  .expectBadge({
    label: 'version',
    message: 'repo not found, branch not found, or lerna.json missing',
  })
