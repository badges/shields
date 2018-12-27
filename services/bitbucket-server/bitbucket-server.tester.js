'use strict'

const t = (module.exports = require('../create-service-tester')())

t.create('Bitbucket PR Count')
  .get('/https/bitbucket.mydomain.net/project/repo/pr.json')
  .intercept(h =>
    h('https://bitbucket.mydomain.net')
      .get(
        '/rest/api/1.0/projects/project/repos/repo/pull-requests?limit=100&state=OPEN&wthProperties=false&withAttributes=false'
      )
      .reply(200, { size: 42 })
  )
  .expectJSON({ name: 'Open Pull Requests', value: '42' })
