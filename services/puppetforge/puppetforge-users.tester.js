'use strict'

const { ServiceTester } = require('../tester')
const { isMetric } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'PuppetForgeUsers',
  title: 'PuppetForge Users',
  pathPrefix: '/puppetforge',
}))

t.create('releases by user')
  .get('/rc/camptocamp.json')
  .expectBadge({
    label: 'releases',
    message: isMetric,
  })

t.create('releases by user')
  .get('/rc/not-a-real-user.json')
  .expectBadge({
    label: 'releases',
    message: 'not found',
  })

t.create('modules by user')
  .get('/mc/camptocamp.json')
  .expectBadge({
    label: 'modules',
    message: isMetric,
  })

t.create('modules by user')
  .get('/mc/not-a-real-user.json')
  .expectBadge({
    label: 'modules',
    message: 'not found',
  })
