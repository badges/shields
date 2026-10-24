import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Contributors').get('/contributors/badges/shields.json').expectBadge({
  label: 'contributors',
  message: isMetric,
})

t.create('1 contributor')
  .get('/contributors/badges/shields-tests.json')
  .expectBadge({
    label: 'contributors',
    message: '1',
  })

t.create('Contributors (repo not found)')
  .get('/contributors/badges/helmets.json')
  .expectBadge({
    label: 'contributors',
    message: 'repo not found',
  })

t.create('Contributors (too many to compute)')
  .get('/contributors/NixOS/nixpkgs.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/NixOS/nixpkgs/contributors')
      .query({ page: '1', per_page: '1', anon: 'false' })
      .reply(403, {
        message:
          'The history or contributor list is too large to list contributors for this repository via the API.',
        documentation_url:
          'https://docs.github.com/rest/repos/repos#list-repository-contributors',
        status: '403',
      }),
  )
  .expectBadge({
    label: 'contributors',
    message: 'High contributor count',
    color: 'lightgrey',
  })
