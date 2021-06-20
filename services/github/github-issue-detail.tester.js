import Joi from 'joi'
import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('github issue state')
  .get('/issues/detail/state/badges/shields/979.json')
  .expectBadge({
    label: 'issue 979',
    message: Joi.equal('open', 'closed'),
  })

t.create('github issue state (repo not found)')
  .get('/issues/detail/state/badges/helmets/979.json')
  .expectBadge({
    label: 'issue/pull request',
    message: 'issue, pull request or repo not found',
  })

t.create('github issue title')
  .get('/issues/detail/title/badges/shields/979.json')
  .expectBadge({
    label: 'issue 979',
    message: 'Github rate limits cause transient service test failures in CI',
  })

t.create('github issue author')
  .get('/issues/detail/author/badges/shields/979.json')
  .expectBadge({ label: 'author', message: 'paulmelnikow' })

t.create('github issue label')
  .get('/issues/detail/label/badges/shields/979.json')
  .expectBadge({
    label: 'label',
    message: Joi.equal(
      'bug | developer-experience',
      'developer-experience | bug'
    ),
  })

t.create('github issue comments')
  .get('/issues/detail/comments/badges/shields/979.json')
  .expectBadge({
    label: 'comments',
    message: Joi.number().greater(15),
  })

t.create('github issue age')
  .get('/issues/detail/age/badges/shields/979.json')
  .expectBadge({ label: 'created', message: isFormattedDate })

t.create('github issue update')
  .get('/issues/detail/last-update/badges/shields/979.json')
  .expectBadge({ label: 'updated', message: isFormattedDate })

t.create('github pull request merge state')
  .get('/pulls/detail/state/pingcap/raft-rs/201.json')
  .expectBadge({ label: 'pull request 201', message: 'merged' })

t.create('github pull request merge state (pull request not found)')
  // it's an issue
  .get('/pulls/detail/state/pingcap/raft-rs/177.json')
  .expectBadge({
    label: 'issue/pull request',
    message: 'issue, pull request or repo not found',
  })
