'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const { isMetric, isMetricOverTimePeriod } = require('../test-validators')

const t = new ServiceTester({
  id: 'wordpress',
  title: 'Wordpress Download Tests',
})
module.exports = t

t.create('Plugin Downloads - Total')
  .get('/plugin/dt/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )
t.create('Plugin Downloads - Active')
  .get('/plugin/installs/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'active installs',
      value: Joi.string().regex(/^[1-9][0-9]*[kMGTPEZY]\+?$/),
    })
  )

t.create('Plugin Downloads - Day')
  .get('/plugin/dd/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('Plugin Downloads - Week')
  .get('/plugin/dw/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('Plugin Downloads - Month')
  .get('/plugin/dm/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('Theme Downloads - Total')
  .get('/theme/dt/twentyseventeen.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )
t.create('Theme Downloads - Active')
  .get('/theme/installs/twentyseventeen.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'active installs',
      value: Joi.string().regex(/^[1-9][0-9]*[kMGTPEZY]\+?$/),
    })
  )

t.create('Plugin Downloads - Total | Not Found')
  .get('/plugin/dt/100.json')
  .expectJSON({
    name: 'downloads',
    value: 'not found',
  })
t.create('Plugin Downloads - Active | Not Found')
  .get('/plugin/installs/100.json')
  .expectJSON({
    name: 'active installs',
    value: 'not found',
  })

t.create('Plugin Downloads - Day | Not Found')
  .get('/plugin/dd/100.json')
  .expectJSON({
    name: 'downloads',
    value: 'plugin not found or too new',
  })

t.create('Plugin Downloads - Week | Not Found')
  .get('/plugin/dw/100.json')
  .expectJSON({
    name: 'downloads',
    value: 'plugin not found or too new',
  })

t.create('Plugin Downloads - Month | Not Found')
  .get('/plugin/dm/100.json')
  .expectJSON({
    name: 'downloads',
    value: 'plugin not found or too new',
  })

t.create('Theme Downloads - Total | Not Found')
  .get('/theme/dt/100.json')
  .expectJSON({
    name: 'downloads',
    value: 'not found',
  })
t.create('Theme Downloads - Active | Not Found')
  .get('/theme/installs/100.json')
  .expectJSON({
    name: 'active installs',
    value: 'not found',
  })
