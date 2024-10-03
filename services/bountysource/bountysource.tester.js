import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'bountysource',
  title: 'Bountysource',
})

t.create('bounties').get('/team/mozilla-core/activity.json').expectBadge({
  label: 'bountysource',
  message: 'no longer available',
})
