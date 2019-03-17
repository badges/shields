'use strict'

const { ServiceTester } = require('../tester')

const t = new ServiceTester({ id: 'issuestats', title: 'Issue Stats' })
module.exports = t

t.create('no longer available (previously issue analysis)')
  .get('/i/github/expressjs/express.json')
  .expectBadge({
    label: 'issue stats',
    message: 'no longer available',
  })

t.create('no longer available (previously pull request analysis, long form)')
  .get('/p/long/github/expressjs/express.json')
  .expectBadge({
    label: 'issue stats',
    message: 'no longer available',
  })
