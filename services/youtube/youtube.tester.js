import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'youtube',
  title: 'YouTube',
})

t.create('retired badge (previously channel view count)')
  .get('/channel/views/UC8butISFwT-Wl7EV0hUK0BQ.json')
  .expectBadge({
    label: 'youtube',
    message: 'retired badge',
  })

t.create('retired badge (previously video comment count)')
  .get('/comments/wGJHwc5ksMA.json')
  .expectBadge({
    label: 'youtube',
    message: 'retired badge',
  })

t.create('retired badge (previously video like count)')
  .get('/likes/pU9Q6oiQNd0.json')
  .expectBadge({
    label: 'youtube',
    message: 'retired badge',
  })

t.create('retired badge (previously subscriber count)')
  .get('/channel/subscribers/UC8butISFwT-Wl7EV0hUK0BQ.json')
  .expectBadge({
    label: 'youtube',
    message: 'retired badge',
  })

t.create('retired badge (previously video view count)')
  .get('/views/abBdk8bSPKU.json')
  .expectBadge({
    label: 'youtube',
    message: 'retired badge',
  })
