import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'PubPopularity',
  title: 'PubPopularity',
  pathPrefix: '/pub/popularity',
})

t.create('pub popularity').get('/analysis_options.json').expectBadge({
  label: 'popularity',
  message: 'no longer available',
})
