import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('last update for redis/latest/stable')
  .get('/redis/latest/stable.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last update for redis/latest/stable and query param arch=arm64')
  .get('/redis/latest/stable.json?arch=arm64')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('last update when package not found')
  .get('/fake_package/fake/fake.json')
  .expectBadge({
    label: 'last updated',
    message: 'package not found',
  })

t.create('last update for redis and invalid track')
  .get('/redis/notFound/stable.json')
  .expectBadge({
    label: 'last updated',
    message: 'track not found',
  })

t.create('last update for redis/latest and invalid risk')
  .get('/redis/latest/notFound.json')
  .expectBadge({
    label: 'last updated',
    message: 'risk not found',
  })

t.create('last update for redis/latest/stable and invalid arch (query param)')
  .get('/redis/latest/stable.json?arch=fake')
  .expectBadge({
    label: 'last updated',
    message: 'arch not found',
  })
