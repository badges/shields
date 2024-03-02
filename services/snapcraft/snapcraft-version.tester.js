import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Snapcraft Version for redis')
  .get('/redis/latest/stable.json')
  .expectBadge({
    label: 'snapcraft',
    message: isSemver,
  })

t.create('Snapcraft Version for redis (query param arch=arm64)')
  .get('/redis/latest/stable.json?arch=arm64')
  .expectBadge({
    label: 'snapcraft',
    message: isSemver,
  })

t.create('Snapcraft Version for redis (invalid package)')
  .get('/this_package_doesnt_exist/fake/fake.json')
  .expectBadge({
    label: 'snapcraft',
    message: 'package not found',
  })

t.create('Snapcraft Version for redis (invalid track)')
  .get('/redis/notfound/stable.json')
  .expectBadge({
    label: 'snapcraft',
    message: 'track not found',
  })

t.create('Snapcraft Version for redis (invalid risk)')
  .get('/redis/latest/notfound.json')
  .expectBadge({
    label: 'snapcraft',
    message: 'risk not found',
  })

t.create('Snapcraft Version for redis (invalid arch)')
  .get('/redis/latest/stable.json?arch=fake')
  .expectBadge({
    label: 'snapcraft',
    message: 'arch not found',
  })
