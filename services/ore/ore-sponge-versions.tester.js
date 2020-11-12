'use strict'

const Joi = require('joi').extend(joi => ({
  base: joi.array(),
  coerce: (value, helpers) => ({
    value: value.split ? value.split(' | ') : value,
  }),
  type: 'versionArray',
}))
const isDottedVersionAtLeastOne = Joi.string().regex(/\d+(\.\d+)?(\.\d+)?$/)
const t = (module.exports = require('../tester').createServiceTester())

t.create('Nucleus (pluginId nucleus)')
  .get('/nucleus.json')
  .expectBadge({
    label: 'sponge',
    message: Joi.versionArray().items(isDottedVersionAtLeastOne),
  })

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'sponge',
  message: 'not found',
})
