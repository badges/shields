'use strict'

const Joi = require('joi')
const {
  isSemver,
  isStarRating,
  isFormattedDate,
} = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'vaadin-directory',
  title: 'vaadin directory',
}))

t.create('stars of component displayed in star icons')
  .get('/star/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'stars',
    message: isStarRating,
  })

t.create('stars of component displayed in star icons')
  .get('/stars/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'stars',
    message: isStarRating,
  })

t.create('publish status of the component')
  .get('/status/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'vaadin directory',
    message: Joi.equal(
      'published',
      'unpublished',
      'incomplete',
      'reported',
      'suspended',
      'deleted'
    ),
  })

t.create('rating of the component (eg: 4.2/5)')
  .get('/rating/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d\.\d\/5$/),
  })

t.create('rating count of component')
  .get('/rc/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'rating count',
    message: Joi.string().regex(/^\d+?\stotal$/),
  })

t.create('rating count of component')
  .get('/rating-count/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'rating count',
    message: Joi.string().regex(/^\d+?\stotal$/),
  })

t.create('latest version of the component (can have v prefixed or without)')
  .get('/v/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'latest ver',
    message: isSemver,
  })

t.create('latest version of the component (can have v prefixed or without)')
  .get('/version/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'latest ver',
    message: isSemver,
  })

t.create('latest release date of the component (format: yyyy-mm-dd)')
  .get('/rd/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'latest release date',
    message: isFormattedDate,
  })

t.create('latest release date of the component (format: yyyy-mm-dd)')
  .get('/release-date/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'latest release date',
    message: isFormattedDate,
  })

t.create('Invalid addon')
  .get('/stars/404.json')
  .expectBadge({
    label: 'vaadin directory',
    message: 'not found',
  })

t.create('No connection')
  .get('/stars/vaadinvaadin-grid.json')
  .networkOff()
  .expectBadge({
    label: 'vaadin directory',
    message: 'inaccessible',
  })
