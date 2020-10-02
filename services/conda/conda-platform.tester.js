'use strict'

const Joi = require('joi')
const isCondaPlatform = Joi.string().regex(/^\w+-[\w\d]+( \| \w+-[\w\d]+)*$/)
const t = (module.exports = require('../tester').createServiceTester())

t.create('platform').get('/p/conda-forge/zlib.json').expectBadge({
  label: 'conda|platform',
  message: isCondaPlatform,
})

t.create('platform (skip prefix)')
  .get('/pn/conda-forge/zlib.json')
  .expectBadge({
    label: 'platform',
    message: isCondaPlatform,
  })
