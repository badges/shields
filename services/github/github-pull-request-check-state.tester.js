'use strict'

const t = (module.exports = require('../create-service-tester')())

t.create('github pull request check state')
  .get('/s/pulls/badges/shields/1110.json')
  .expectJSON({ name: 'checks', value: 'failure' })

t.create('github pull request check state (pull request not found)')
  .get('/s/pulls/badges/shields/5110.json')
  .expectJSON({ name: 'checks', value: 'pull request or repo not found' })

t.create(
  "github pull request check state (ref returned by github doens't exist"
)
  .get('/s/pulls/badges/shields/1110.json')
  .intercept(
    nock =>
      nock('https://api.github.com', { allowUnmocked: true })
        .get('/repos/badges/shields/pulls/1110')
        .reply(200, JSON.stringify({ head: { sha: 'abc123' } })) // Looks like a real ref, but isn't.
  )
  .networkOn()
  .expectJSON({
    name: 'checks',
    value: 'commit not found',
  })

t.create('github pull request check contexts')
  .get('/contexts/pulls/badges/shields/1110.json')
  .expectJSON({ name: 'checks', value: '1 failure' })
