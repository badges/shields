'use strict'

const Joi = require('joi')
const { ServiceTester } = require('..')
const label = 'hsts'

const t = (module.exports = new ServiceTester({
  id: 'hsts',
  title: 'HSTS Preload',
}))

t.create('gets the hsts status of github')
  .get('/github.com.json')
  .expectJSONTypes(Joi.object().keys({ name: label, value: 'preloaded' }))

t.create('gets the hsts status of apviz')
  .get('/apviz.io.json')
  .expectJSON({ name: label, value: 'pending' })

t.create('gets the hsts status of baidu')
  .get('/baidu.com.json')
  .expectJSON({ name: label, value: 'unknown' })

t.create('invalid uri')
  .get('/does-not-exist.json')
  .expectJSON({ name: label, value: 'unknown' })
