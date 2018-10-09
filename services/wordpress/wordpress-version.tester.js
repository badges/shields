'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = new ServiceTester({
  id: 'wordpress',
  title: 'Wordpress Version Tests',
})
module.exports = t

t.create('Plugin Version')
  .get('/plugin/v/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'plugin',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Theme Version')
  .get('/theme/v/twentyseventeen.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'theme',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Plugin Version | Not Found')
  .get('/plugin/v/100.json')
  .expectJSON({
    name: 'plugin',
    value: 'not found',
  })

t.create('Theme Version | Not Found')
  .get('/theme/v/100.json')
  .expectJSON({
    name: 'theme',
    value: 'not found',
  })
