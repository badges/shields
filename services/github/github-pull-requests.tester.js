import Joi from 'joi'
import { isMetric, isMetricOpenIssues } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('GitHub pull requests')
  .get('/issues-pr/badges/shields.json')
  .expectBadge({
    label: 'pull requests',
    message: isMetricOpenIssues,
  })

t.create('GitHub pull requests without a draft filter')
  .get('/issues-pr/example/project.json')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql', requestBody => {
        const { query, variables } =
          typeof requestBody === 'string'
            ? JSON.parse(requestBody)
            : requestBody
        return (
          query.includes('search(query: $query, type: ISSUE)') &&
          variables.query === 'repo:example/project is:pr is:open'
        )
      })
      .reply(200, {
        data: { repository: { id: 'R_example' }, search: { issueCount: 5 } },
      }),
  )
  .expectBadge({
    label: 'pull requests',
    message: '5 open',
  })

t.create('GitHub pull requests raw without a draft filter')
  .get('/issues-pr-raw/example/project.json')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql', requestBody => {
        const { query, variables } =
          typeof requestBody === 'string'
            ? JSON.parse(requestBody)
            : requestBody
        return (
          query.includes('search(query: $query, type: ISSUE)') &&
          variables.query === 'repo:example/project is:pr is:open'
        )
      })
      .reply(200, {
        data: { repository: { id: 'R_example' }, search: { issueCount: 5 } },
      }),
  )
  .expectBadge({
    label: 'open pull requests',
    message: '5',
  })

t.create('GitHub pull requests raw')
  .get('/issues-pr-raw/badges/shields.json')
  .expectBadge({
    label: 'open pull requests',
    message: isMetric,
  })

t.create('GitHub closed pull requests without a draft filter')
  .get('/issues-pr-closed/example/project.json')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql', requestBody => {
        const { query, variables } =
          typeof requestBody === 'string'
            ? JSON.parse(requestBody)
            : requestBody
        return (
          query.includes('search(query: $query, type: ISSUE)') &&
          variables.query === 'repo:example/project is:pr is:closed'
        )
      })
      .reply(200, {
        data: { repository: { id: 'R_example' }, search: { issueCount: 7 } },
      }),
  )
  .expectBadge({
    label: 'pull requests',
    message: '7 closed',
  })

t.create('GitHub closed pull requests')
  .get('/issues-pr-closed/badges/shields.json')
  .expectBadge({
    label: 'pull requests',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) closed$/,
    ),
  })

t.create('GitHub closed pull requests raw without a draft filter')
  .get('/issues-pr-closed-raw/example/project.json')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql', requestBody => {
        const { query, variables } =
          typeof requestBody === 'string'
            ? JSON.parse(requestBody)
            : requestBody
        return (
          query.includes('search(query: $query, type: ISSUE)') &&
          variables.query === 'repo:example/project is:pr is:closed'
        )
      })
      .reply(200, {
        data: { repository: { id: 'R_example' }, search: { issueCount: 7 } },
      }),
  )
  .expectBadge({
    label: 'closed pull requests',
    message: '7',
  })

t.create('GitHub closed pull requests raw')
  .get('/issues-pr-closed-raw/badges/shields.json')
  .expectBadge({
    label: 'closed pull requests',
    message: isMetric,
  })

t.create('GitHub closed pull requests raw with only drafts')
  .get('/issues-pr-closed-raw/example/project.json?onlyDrafts')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql', requestBody => {
        const { query, variables } =
          typeof requestBody === 'string'
            ? JSON.parse(requestBody)
            : requestBody
        return (
          query.includes('search(query: $query, type: ISSUE)') &&
          variables.query === 'repo:example/project is:pr is:closed draft:true'
        )
      })
      .reply(200, {
        data: { repository: { id: 'R_example' }, search: { issueCount: 1 } },
      }),
  )
  .expectBadge({
    label: 'closed drafts pull requests',
    message: '1',
  })

t.create('GitHub pull requests excluding drafts')
  .get('/issues-pr/example/project.json?excludeDrafts')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql', requestBody => {
        const { query, variables } =
          typeof requestBody === 'string'
            ? JSON.parse(requestBody)
            : requestBody
        return (
          query.includes('search(query: $query, type: ISSUE)') &&
          variables.query === 'repo:example/project is:pr is:open draft:false'
        )
      })
      .reply(200, {
        data: { repository: { id: 'R_example' }, search: { issueCount: 3 } },
      }),
  )
  .expectBadge({
    label: 'non-drafts pull requests',
    message: '3 open',
  })

t.create('GitHub pull requests with only drafts')
  .get('/issues-pr/example/project.json?onlyDrafts')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql', requestBody => {
        const { query, variables } =
          typeof requestBody === 'string'
            ? JSON.parse(requestBody)
            : requestBody
        return (
          query.includes('search(query: $query, type: ISSUE)') &&
          variables.query === 'repo:example/project is:pr is:open draft:true'
        )
      })
      .reply(200, {
        data: { repository: { id: 'R_example' }, search: { issueCount: 2 } },
      }),
  )
  .expectBadge({
    label: 'drafts pull requests',
    message: '2 open',
  })

t.create('GitHub pull requests by multi-word label excluding drafts')
  .get('/issues-pr/example/project/feature%20request.json?excludeDrafts')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql', requestBody => {
        const { query, variables } =
          typeof requestBody === 'string'
            ? JSON.parse(requestBody)
            : requestBody
        return (
          query.includes('search(query: $query, type: ISSUE)') &&
          variables.query ===
            'repo:example/project is:pr is:open label:"feature request" draft:false'
        )
      })
      .reply(200, {
        data: { repository: { id: 'R_example' }, search: { issueCount: 2 } },
      }),
  )
  .expectBadge({
    label: '"feature request" non-drafts pull requests',
    message: '2 open',
  })

t.create('GitHub pull requests with conflicting draft filters')
  .get('/issues-pr/example/project.json?excludeDrafts&onlyDrafts')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql')
      .optionally()
      .reply(() => {
        throw new Error('GitHub should not be called for invalid query params')
      }),
  )
  .expectBadge({
    label: 'pull requests',
    message: Joi.string().pattern(/^invalid query parameter/),
  })

t.create('GitHub pull requests (repo not found)')
  .get('/issues-pr/example/missing.json')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql', requestBody => {
        const { query, variables } =
          typeof requestBody === 'string'
            ? JSON.parse(requestBody)
            : requestBody
        return (
          query.includes('repository(owner: $user, name: $repo)') &&
          query.includes('search(query: $query, type: ISSUE)') &&
          variables.user === 'example' &&
          variables.repo === 'missing' &&
          variables.query === 'repo:example/missing is:pr is:open'
        )
      })
      .reply(200, {
        data: { repository: null, search: { issueCount: 0 } },
        errors: [
          { type: 'NOT_FOUND', message: 'Could not resolve repository' },
        ],
      }),
  )
  .expectBadge({
    label: 'pull requests',
    message: 'repo not found',
  })

t.create('GitHub open pull requests by label')
  .get('/issues-pr/badges/shields/service-badge.json')
  .expectBadge({
    label: 'service-badge pull requests',
    message: isMetricOpenIssues,
  })

t.create('GitHub open pull requests by label (raw)')
  .get('/issues-pr-raw/badges/shields/service-badge.json')
  .expectBadge({
    label: 'open service-badge pull requests',
    message: isMetric,
  })
