'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Stars (User)')
  .get('/hemantsonu20.json')
  .expectBadge({
    label: 'Stars',
    message: isMetric,
    link: ['https://github.com/hemantsonu20'],
  })

t.create('Stars (User) with affiliations')
  .get('/hemantsonu20.json?affiliations=OWNER,COLLABORATOR')
  .expectBadge({
    label: 'Stars',
    message: isMetric,
    link: ['https://github.com/hemantsonu20'],
  })

t.create('Stars (User) with all affiliations')
  .get('/chris48s.json?affiliations=OWNER,COLLABORATOR,ORGANIZATION_MEMBER')
  .expectBadge({
    label: 'Stars',
    message: isMetric,
    link: ['https://github.com/chris48s'],
  })

t.create('Stars (User) with invalid affiliations')
  .get('/hemantsonu20.json?affiliations=UNKNOWN')
  .expectBadge({
    label: 'Stars',
    message: 'invalid query parameter: affiliations',
    link: [],
  })

t.create('Stars (User) with invalid affiliations space')
  .get('/hemantsonu20.json?affiliations=OWNER, COLLABORATOR')
  .expectBadge({
    label: 'Stars',
    message: 'invalid query parameter: affiliations',
    link: [],
  })

t.create('Stars (User) unknown user')
  .get('/hemantsonu20-fake-user.json')
  .expectBadge({
    label: 'Stars',
    message: 'user not found',
    link: [],
  })

t.create('Stars (Org)')
  .get('/badges.json?org')
  .expectBadge({
    label: 'Stars',
    message: isMetric, // matches format 13k
    link: ['https://github.com/badges'],
  })

t.create('Stars (Org) Lots of repo')
  .get('/github.json?org')
  .expectBadge({
    label: 'Stars',
    message: isMetric, // matches format 303k
    link: ['https://github.com/github'],
  })

t.create('Stars (Org) unknown org').get('/badges-fake.json?org').expectBadge({
  label: 'Stars',
  message: 'org not found',
  link: [],
})
