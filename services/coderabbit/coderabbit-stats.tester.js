import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('live CodeRabbitStats')
  .get('/stats/github/coderabbitai/ast-grep-essentials.json')
  .expectBadge({
    label: 'CodeRabbit',
    message: /^\d+ Reviews$/, // Using regex pattern instead of isMetric
    color: '#ff570a',
    labelColor: '#171717',
  })

t.create('CodeRabbitStats valid repo')
  .get('/stats/github/coderabbitai/ast-grep-essentials.json')
  .intercept(nock =>
    nock('https://api.coderabbit.ai')
      .get('/stats/github/coderabbitai/ast-grep-essentials')
      .reply(200, { reviews: 101 }),
  )
  .expectBadge({
    label: 'CodeRabbit',
    message: '101 Reviews',
    color: '#ff570a',
    labelColor: '#171717',
  })

t.create('CodeRabbitStats repo not found')
  .get('/stats/github/not-valid/not-found.json')
  .intercept(nock =>
    nock('https://api.coderabbit.ai')
      .get('/stats/github/not-valid/not-found')
      .reply(404, 'invalid'),
  )
  .expectBadge({
    label: 'CodeRabbit',
    message: 'Not Found: invalid',
    color: '#9f9f9f', // Note: without # prefix
    labelColor: '#171717', // Note: without # prefix
  })

t.create('CodeRabbitStats server error')
  .get('/stats/github/coderabbitai/error-repo.json')
  .intercept(nock =>
    nock('https://api.coderabbit.ai')
      .get('/stats/github/coderabbitai/error-repo')
      .reply(500, 'Internal Server Error'),
  )
  .expectBadge({
    label: 'CodeRabbit',
    message: 'Inaccessible: Got status code 500 (expected 200)', // Match exact error message
    color: '#9f9f9f',
    labelColor: '#171717',
  })
