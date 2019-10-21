'use strict'

const { ServiceTester } = require('../tester')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')

const t = new ServiceTester({
  id: 'wordpress',
  title: 'WordPress Download Tests',
})
module.exports = t

t.create('Plugin Downloads - Total')
  .get('/plugin/dt/akismet.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('Plugin Downloads - Active')
  .get('/plugin/installs/akismet.json')
  .expectBadge({
    label: 'active installs',
    message: isMetric,
  })

t.create('Plugin Downloads - Day')
  .get('/plugin/dd/akismet.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('Plugin Downloads - Week')
  .get('/plugin/dw/akismet.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('Plugin Downloads - Month')
  .get('/plugin/dm/akismet.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('Plugin Downloads - Year')
  .get('/plugin/dy/akismet.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('Theme Downloads - Total')
  .get('/theme/dt/twentyseventeen.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('Theme Downloads - Active')
  .get('/theme/installs/twentyseventeen.json')
  .expectBadge({
    label: 'active installs',
    message: isMetric,
  })

t.create('Theme Downloads - Day')
  .get('/theme/dd/twentyseventeen.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('Theme Downloads - Week')
  .get('/theme/dw/twentyseventeen.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('Theme Downloads - Month')
  .get('/theme/dm/twentyseventeen.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('Theme Downloads - Year')
  .get('/theme/dy/twentyseventeen.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('Plugin Downloads - Total | Not Found')
  .get('/plugin/dt/100.json')
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })

t.create('Plugin Downloads - Active | Not Found')
  .get('/plugin/installs/100.json')
  .expectBadge({
    label: 'active installs',
    message: 'not found',
  })

t.create('Plugin Downloads - Day | Not Found')
  .get('/plugin/dd/100.json')
  .expectBadge({
    label: 'downloads',
    message: 'plugin not found or too new',
  })

t.create('Plugin Downloads - Week | Not Found')
  .get('/plugin/dw/100.json')
  .expectBadge({
    label: 'downloads',
    message: 'plugin not found or too new',
  })

t.create('Plugin Downloads - Month | Not Found')
  .get('/plugin/dm/100.json')
  .expectBadge({
    label: 'downloads',
    message: 'plugin not found or too new',
  })

t.create('Plugin Downloads - Year | Not Found')
  .get('/plugin/dy/100.json')
  .expectBadge({
    label: 'downloads',
    message: 'plugin not found or too new',
  })

t.create('Theme Downloads - Total | Not Found')
  .get('/theme/dt/100.json')
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })

t.create('Theme Downloads - Active | Not Found')
  .get('/theme/installs/100.json')
  .expectBadge({
    label: 'active installs',
    message: 'not found',
  })

t.create('Theme Downloads - Day | Not Found')
  .get('/theme/dd/100.json')
  .expectBadge({
    label: 'downloads',
    message: 'theme not found or too new',
  })

t.create('Theme Downloads - Week | Not Found')
  .get('/theme/dw/100.json')
  .expectBadge({
    label: 'downloads',
    message: 'theme not found or too new',
  })

t.create('Theme Downloads - Month | Not Found')
  .get('/theme/dm/100.json')
  .expectBadge({
    label: 'downloads',
    message: 'theme not found or too new',
  })

t.create('Theme Downloads - Year | Not Found')
  .get('/theme/dy/100.json')
  .expectBadge({
    label: 'downloads',
    message: 'theme not found or too new',
  })
