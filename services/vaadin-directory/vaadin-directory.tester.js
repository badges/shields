'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

// Get validate function from validator.js lib
const {
  isSemver,
  isStarRating,
  isFormattedDate,
} = require('../test-validators')

const t = new ServiceTester({
  id: 'vaadin-directory',
  title: 'vaadin directory',
})
module.exports = t

t.create('stars of component displayed in star icons')
  .get('/star/vaadinvaadin-grid.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stars',
      value: isStarRating,
    })
  )

t.create('stars of component displayed in star icons')
  .get('/stars/vaadinvaadin-grid.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stars',
      value: isStarRating,
    })
  )

t.create('publish status of the component')
  .get('/status/vaadinvaadin-grid.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'vaadin directory',
      value: Joi.equal(
        'published',
        'unpublished',
        'incomplete',
        'reported',
        'suspended',
        'deleted'
      ),
    })
  )

t.create('rating of the component (eg: 4.2/5)')
  .get('/rating/vaadinvaadin-grid.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: Joi.string().regex(/^\d\.\d\/5$/),
    })
  )

t.create('rating count of component')
  .get('/rc/vaadinvaadin-grid.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating count',
      value: Joi.string().regex(/^\d+?\stotal$/),
    })
  )

t.create('rating count of component')
  .get('/rating-count/vaadinvaadin-grid.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating count',
      value: Joi.string().regex(/^\d+?\stotal$/),
    })
  )

t.create('latest version of the component (can have v prefixed or without)')
  .get('/v/vaadinvaadin-grid.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'latest ver',
      value: isSemver,
    })
  )

t.create('latest version of the component (can have v prefixed or without)')
  .get('/version/vaadinvaadin-grid.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'latest ver',
      value: isSemver,
    })
  )

t.create('latest release date of the component (format: yyyy-mm-dd)')
  .get('/rd/vaadinvaadin-grid.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'latest release date',
      value: isFormattedDate,
    })
  )

t.create('latest release date of the component (format: yyyy-mm-dd)')
  .get('/release-date/vaadinvaadin-grid.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'latest release date',
      value: isFormattedDate,
    })
  )

t.create('Invalid addon')
  .get('/stars/404.json')
  .expectJSON({
    name: 'vaadin directory',
    value: 'not found',
  })

t.create('No connection')
  .get('/stars/vaadinvaadin-grid.json')
  .networkOff()
  .expectJSON({
    name: 'vaadin directory',
    value: 'inaccessible',
  })
