'use strict'

const Joi = require('joi')
const { isFileSize } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('File size')
  .get('/webcaetano/craft/build/phaser-craft.min.js.json')
  .expectJSONTypes(Joi.object().keys({ name: 'size', value: isFileSize }))

t.create('File size 404')
  .get('/webcaetano/craft/build/does-not-exist.min.js.json')
  .expectJSON({ name: 'size', value: 'repo or file not found' })

t.create('File size for "not a regular file"')
  .get('/webcaetano/craft/build.json')
  .expectJSON({ name: 'size', value: 'not a regular file' })
