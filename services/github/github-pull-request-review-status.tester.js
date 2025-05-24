import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Pull Request Review Status (approved)')
  .get('/badges/shields/1111.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequest: {
              reviewDecision: 'APPROVED',
              reviews: {
                nodes: [
                  { state: 'APPROVED', author: { login: 'octocat' } },
                  { state: 'APPROVED', author: { login: 'hubot' } },
                ],
              },
              reviewRequests: {
                nodes: [
                  { requestedReviewer: { login: 'octocat' } },
                  { requestedReviewer: { login: 'hubot' } },
                ],
              },
            },
          },
        },
      }),
  )
  .expectBadge({
    label: 'review status',
    message: 'approved',
    color: 'brightgreen',
  })

t.create('Pull Request Review Status (changes requested)')
  .get('/badges/shields/1111.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequest: {
              reviewDecision: 'CHANGES_REQUESTED',
              reviews: {
                nodes: [
                  { state: 'CHANGES_REQUESTED', author: { login: 'octocat' } },
                  { state: 'APPROVED', author: { login: 'hubot' } },
                ],
              },
              reviewRequests: {
                nodes: [
                  { requestedReviewer: { login: 'octocat' } },
                  { requestedReviewer: { login: 'hubot' } },
                ],
              },
            },
          },
        },
      }),
  )
  .expectBadge({
    label: 'review status',
    message: 'changes requested (1 requested changes)',
    color: 'orange',
  })

t.create('Pull Request Review Status (in progress)')
  .get('/badges/shields/1111.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequest: {
              reviewDecision: 'REVIEW_REQUIRED',
              reviews: {
                nodes: [
                  { state: 'APPROVED', author: { login: 'octocat' } },
                  { state: 'PENDING', author: { login: 'hubot' } },
                  { state: 'DISMISSED', author: { login: 'bot' } },
                ],
              },
              reviewRequests: {
                nodes: [
                  { requestedReviewer: { login: 'octocat' } },
                  { requestedReviewer: { login: 'hubot' } },
                ],
              },
            },
          },
        },
      }),
  )
  .expectBadge({
    label: 'review status',
    message: '1/2 approved (1 pending) (1 dismissed)',
    color: 'yellow',
  })

t.create('Pull Request Review Status (not found)')
  .get('/badges/shields/1111.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequest: null,
          },
        },
      }),
  )
  .expectBadge({
    label: 'review status',
    message: 'pull request not found',
    color: 'red',
  })

t.create('Pull Request Review Status (by reviewer - approved)')
  .get('/badges/shields/1111.json?reviewer=octocat')
  .intercept(nock =>
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequest: {
              reviewDecision: 'REVIEW_REQUIRED',
              reviews: {
                nodes: [
                  { state: 'APPROVED', author: { login: 'octocat' } },
                  { state: 'PENDING', author: { login: 'hubot' } },
                ],
              },
              reviewRequests: {
                nodes: [
                  { requestedReviewer: { login: 'octocat' } },
                  { requestedReviewer: { login: 'hubot' } },
                ],
              },
            },
          },
        },
      }),
  )
  .expectBadge({
    label: 'review status',
    message: 'approved',
    color: 'brightgreen',
  })

t.create('Pull Request Review Status (by reviewer - pending)')
  .get('/badges/shields/1111.json?reviewer=hubot')
  .intercept(nock =>
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequest: {
              reviewDecision: 'REVIEW_REQUIRED',
              reviews: {
                nodes: [
                  { state: 'APPROVED', author: { login: 'octocat' } },
                  { state: 'PENDING', author: { login: 'hubot' } },
                ],
              },
              reviewRequests: {
                nodes: [
                  { requestedReviewer: { login: 'octocat' } },
                  { requestedReviewer: { login: 'hubot' } },
                ],
              },
            },
          },
        },
      }),
  )
  .expectBadge({
    label: 'review status',
    message: 'pending',
    color: 'yellow',
  })

t.create('Pull Request Review Status (by reviewer - not reviewed)')
  .get('/badges/shields/1111.json?reviewer=bot')
  .intercept(nock =>
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequest: {
              reviewDecision: 'REVIEW_REQUIRED',
              reviews: {
                nodes: [
                  { state: 'APPROVED', author: { login: 'octocat' } },
                  { state: 'PENDING', author: { login: 'hubot' } },
                ],
              },
              reviewRequests: {
                nodes: [
                  { requestedReviewer: { login: 'octocat' } },
                  { requestedReviewer: { login: 'hubot' } },
                ],
              },
            },
          },
        },
      }),
  )
  .expectBadge({
    label: 'review status',
    message: 'not reviewed',
    color: 'lightgrey',
  })
