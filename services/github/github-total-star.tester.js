import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Stars (User)')
  .get('/hemantsonu20.json')
  .expectBadge({
    label: 'stars',
    message: isMetric,
    link: ['https://github.com/hemantsonu20'],
  })

t.create('Stars (User) with affiliations')
  .get('/hemantsonu20.json?affiliations=OWNER,COLLABORATOR')
  .expectBadge({
    label: 'stars',
    message: isMetric,
    link: ['https://github.com/hemantsonu20'],
  })

t.create('Stars (User) with all affiliations')
  .get('/chris48s.json?affiliations=OWNER,COLLABORATOR,ORGANIZATION_MEMBER')
  .expectBadge({
    label: 'stars',
    message: isMetric,
    link: ['https://github.com/chris48s'],
  })

t.create('Stars (User) with invalid affiliations')
  .get('/hemantsonu20.json?affiliations=UNKNOWN')
  .expectBadge({
    label: 'stars',
    message: 'invalid query parameter: affiliations',
    link: [],
  })

t.create('Stars (User) with invalid affiliations space')
  .get('/hemantsonu20.json?affiliations=OWNER, COLLABORATOR')
  .expectBadge({
    label: 'stars',
    message: 'invalid query parameter: affiliations',
    link: [],
  })

t.create('Stars (Org)')
  .get('/badges.json')
  .expectBadge({
    label: 'stars',
    message: isMetric, // matches format 13k
    link: ['https://github.com/badges'],
  })

t.create('Stars (Org) Lots of repo')
  .get('/github.json')
  .expectBadge({
    label: 'stars',
    message: isMetric, // matches format 303k
    link: ['https://github.com/github'],
  })

t.create('Stars (User/Org) unknown user/org')
  .get('/badges-fake.json')
  .expectBadge({
    label: 'stars',
    message: 'user/org not found',
    link: [],
  })
