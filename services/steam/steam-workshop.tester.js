'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isMetric, isFileSize, isFormattedDate } = require('../test-validators')

const t = new ServiceTester({ id: 'steam', title: 'Steam Workshop Tests' })
module.exports = t

t.create('Collection Files')
  .get('/collection-files/180077636.json')
  .expectJSONTypes(Joi.object().keys({ name: 'files', value: isMetric }))

t.create('File Size')
  .get('/size/1523924535.json')
  .expectJSONTypes(Joi.object().keys({ name: 'size', value: isFileSize }))

t.create('Release Date')
  .get('/release-date/1523924535.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'release date', value: isFormattedDate })
  )

t.create('Subscriptions')
  .get('/subscriptions/1523924535.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'subscriptions', value: isMetric })
  )

t.create('Favorites')
  .get('/favorites/1523924535.json')
  .expectJSONTypes(Joi.object().keys({ name: 'favorites', value: isMetric }))

t.create('Downloads')
  .get('/downloads/1523924535.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }))

t.create('Views')
  .get('/views/1523924535.json')
  .expectJSONTypes(Joi.object().keys({ name: 'views', value: isMetric }))

t.create('Collection Files | Collection Not Found')
  .get('/collection-files/1.json')
  .expectJSON({ name: 'files', value: 'collection not found' })

t.create('File Size | File Not Found')
  .get('/size/1.json')
  .expectJSON({ name: 'size', value: 'file not found' })

t.create('Release Date | File Not Found')
  .get('/release-date/1.json')
  .expectJSON({ name: 'release date', value: 'file not found' })

t.create('Subscriptions | File Not Found')
  .get('/subscriptions/1.json')
  .expectJSON({ name: 'subscriptions', value: 'file not found' })

t.create('Favorites | File Not Found')
  .get('/favorites/1.json')
  .expectJSON({ name: 'favorites', value: 'file not found' })

t.create('Downloads | File Not Found')
  .get('/downloads/1.json')
  .expectJSON({ name: 'downloads', value: 'file not found' })

t.create('Views | File Not Found')
  .get('/views/1.json')
  .expectJSON({ name: 'views', value: 'file not found' })
