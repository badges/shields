'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isMetric } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'ansible',
  title: 'Ansible Galaxy',
}))

t.create('role name (valid)')
  .get('/role/14542.json')
  .expectJSON({ name: 'role', value: 'openwisp.openwisp2' })

t.create('role name (not found)')
  .get('/role/000.json')
  .expectJSON({ name: 'role', value: 'not found' })

t.create('role downloads (valid)')
  .get('/role/d/14542.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'role downloads', value: isMetric })
  )

t.create('role downloads (not found)')
  .get('/role/d/does-not-exist.json')
  .expectJSON({ name: 'role downloads', value: 'not found' })
