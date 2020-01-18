'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('version without a specified tag')
  .get('/_/alpine.json')
  .timeout(150000)
  .expectBadge({
    label: 'version',
    message: '3.11.3',
  })

t.create('version with a specified tag')
  .get('/_/alpine/3.10.json')
  .timeout(150000)
  .expectBadge({
    label: 'version',
    message: '3.10.3',
  })

t.create('specified tag when repository has only one')
  .get('/_/alpine/wrong-tag.json')
  .expectBadge({ label: 'version', message: 'not found' })

t.create('nonexistent repository')
  .get('/_/not-a-real-repo.json')
  .expectBadge({ label: 'version', message: 'not found' })

t.create('nonexistent tag')
  .get('/_/unknown/wrong-tag.json')
  .expectBadge({ label: 'version', message: 'not found' })
