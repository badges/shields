import { semverRange } from '../validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets the peer dependency version')
  .get('/react-boxplot/peer/react.json')
  .expectBadge({
    label: 'react',
    message: semverRange,
  })

t.create('gets the dev dependency version')
  .get('/react-boxplot/dev/react.json?label=react%20tested')
  .expectBadge({
    label: 'react tested',
    message: semverRange,
  })

t.create('gets the dev dependency version (scoped)')
  .get('/@metabolize/react-flexbox-svg/dev/eslint.json?')
  .expectBadge({
    label: 'eslint',
    message: semverRange,
  })

t.create('gets the dev dependency version (scoped dependency)')
  .get('/mocha/dev/@mocha/docdash.json')
  .expectBadge({
    label: '@mocha/docdash',
    message: semverRange,
  })

t.create('gets the prod dependency version')
  .get('/react-boxplot/simple-statistics.json')
  .expectBadge({
    label: 'simple-statistics',
    message: semverRange,
  })

t.create('unknown dependency')
  .get('/react-boxplot/dev/i-made-this-up.json')
  .expectBadge({
    label: 'dependency',
    message: 'dev dependency not found',
  })
