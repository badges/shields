import { ServiceTester } from '../tester.js'
import { isMetric, isMetricOverTimePeriod } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'wordpress',
  title: 'WordPress Download Tests',
})

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

t.create('Plugin Downloads - Day').get('/plugin/dd/akismet.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('Plugin Downloads - Week').get('/plugin/dw/akismet.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('Plugin Downloads - Month')
  .get('/plugin/dm/akismet.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('Plugin Downloads - Year').get('/plugin/dy/akismet.json').expectBadge({
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
