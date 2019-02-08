'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')

const { isStarRating } = require('../test-validators')

const t = new ServiceTester({
  id: 'wordpress',
  title: 'Wordpress Rating Tests',
})
module.exports = t

t.create('Plugin Rating - Stars')
  .get('/plugin/stars/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isStarRating,
    })
  )

t.create('Plugin Rating - Stars | Not Found')
  .get('/plugin/stars/100.json')
  .expectJSON({
    name: 'rating',
    value: 'not found',
  })

t.create('Plugin Rating - Stars (Alias)')
  .get('/plugin/r/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isStarRating,
    })
  )

t.create('Plugin Rating - Stars (Alias) | Not Found')
  .get('/plugin/r/100.json')
  .expectJSON({
    name: 'rating',
    value: 'not found',
  })

t.create('Theme Rating - Stars')
  .get('/theme/stars/twentyseventeen.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isStarRating,
    })
  )

t.create('Theme Rating - Stars | Not Found')
  .get('/theme/stars/100.json')
  .expectJSON({
    name: 'rating',
    value: 'not found',
  })

t.create('Theme Rating - Stars (Alias)')
  .get('/theme/r/twentyseventeen.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isStarRating,
    })
  )

t.create('Theme Rating - Stars (Alias) | Not Found')
  .get('/theme/r/100.json')
  .expectJSON({
    name: 'rating',
    value: 'not found',
  })
