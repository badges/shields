import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('live CodeRabbitStats')
  .get('/stats/github/coderabbitai/ast-grep-essentials.json')
  .expectBadge({
    label: 'CodeRabbit Reviews',
    message: /^\d+$/,
  })

t.create('CodeRabbitStats valid repo')
  .get('/stats/github/coderabbitai/ast-grep-essentials.json')
  .intercept(nock =>
    nock('https://api.coderabbit.ai')
      .get('/stats/github/coderabbitai/ast-grep-essentials')
      .reply(200, { reviews: 101 }),
  )
  .expectBadge({
    label: 'CodeRabbit Reviews',
    message: '101',
  })

t.create('CodeRabbitStats repo not found')
  .get('/stats/github/not-valid/not-found.json')
  .intercept(nock =>
    nock('https://api.coderabbit.ai')
      .get('/stats/github/not-valid/not-found')
      .reply(404, 'repo not found'),
  )
  .expectBadge({
    label: 'CodeRabbit Reviews',
    message: 'repo not found',
  })

t.create('CodeRabbitStats server error')
  .get('/stats/github/coderabbitai/error-repo.json')
  .intercept(nock =>
    nock('https://api.coderabbit.ai')
      .get('/stats/github/coderabbitai/error-repo')
      .reply(500, 'Internal Server Error'),
  )
  .expectBadge({
    label: 'CodeRabbit Reviews',
    message: 'inaccessible',
  })
