'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isMetric } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'AnsibleRole',
  title: 'AnsibleRole',
  pathPrefix: '/ansible/role',
}))

t.create('role name (valid)')
  .get('/14542.json')
  .expectJSON({ name: 'role', value: 'openwisp.openwisp2' })

t.create('role name (not found)')
  .get('/000.json')
  .expectJSON({ name: 'role', value: 'not found' })

t.create('role downloads (valid)')
  .get('/d/14542.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'role downloads', value: isMetric })
  )

t.create('role downloads (not found)')
  .get('/d/does-not-exist.json')
  .expectJSON({ name: 'role downloads', value: 'not found' })
