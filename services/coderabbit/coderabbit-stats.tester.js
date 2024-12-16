import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('CoderabbitStats valid repo')
  .get('/stats/github/coderabbit-ai/demo-repository.json')
  .intercept(nock =>
    nock('https://api.coderabbit.ai')
      .get('/stats/github/coderabbit-ai/demo-repository')
      .reply(200, { prCount: 42 }),
  )
  .expectBadge({
    label: 'coderabbit reviews',
    message: '42 PRs',
    color: 'blue',
  })

t.create('CoderabbitStats repo not found')
  .get('/stats/github/not-valid/not-found.json')
  .intercept(nock =>
    nock('https://api.coderabbit.ai')
      .get('/stats/github/not-valid/not-found')
      .reply(404),
  )
  .expectBadge({
    label: 'coderabbit reviews',
    message: 'repository not found',
    color: 'red',
  })

t.create('CoderabbitStats server error')
  .get('/stats/github/coderabbit-ai/error-repo.json')
  .intercept(nock =>
    nock('https://api.coderabbit.ai')
      .get('/stats/github/coderabbit-ai/error-repo')
      .reply(500),
  )
  .expectBadge({
    label: 'coderabbit reviews',
    message: 'inaccessible',
    color: 'lightgrey', // Changed from 'red' to 'lightgrey'
  })
