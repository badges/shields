import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Release (latest by date)')
  .get('/CanisHelix/shields-badge-test.json')
  .expectBadge({ label: 'release', message: 'v3.0.0', color: 'blue' })

t.create('Release (latest by date, order by created_at)')
  .get('/CanisHelix/shields-badge-test.json?date_order_by=created_at')
  .expectBadge({ label: 'release', message: 'v3.0.0', color: 'blue' })

t.create('Release (latest by date, order by published_at)')
  .get('/CanisHelix/shields-badge-test.json?date_order_by=published_at')
  .expectBadge({ label: 'release', message: 'v3.0.0', color: 'blue' })

t.create('Release (latest by semver)')
  .get('/CanisHelix/shields-badge-test.json?sort=semver')
  .expectBadge({ label: 'release', message: 'v4.0.0', color: 'blue' })

t.create('Release (latest by semver pre-release)')
  .get('/CanisHelix/shields-badge-test.json?sort=semver&include_prereleases')
  .expectBadge({ label: 'release', message: 'v5.0.0-rc1', color: 'orange' })

t.create('Release (project not found)')
  .get('/CanisHelix/does-not-exist.json')
  .expectBadge({ label: 'release', message: 'user or repo not found' })

t.create('Release (no tags)')
  .get('/CanisHelix/shields-badge-test-empty.json')
  .expectBadge({ label: 'release', message: 'no releases found' })

t.create('Release (latest by date) (self-managed)')
  .get('/go-gitea/gitea.json?gitea_url=https://gitea.example.com')
  .intercept(nock =>
    nock('https://gitea.example.com/')
      .get('/api/v1/repos/go-gitea/gitea/releases')
      .reply(200, [
        {
          id: 3318489,
          tag_name: 'v2.0.0',
          name: 'v2.0.0',
          draft: false,
          prerelease: false,
          created_at: '2021-09-15T01:06:43Z',
          published_at: '2021-09-15T01:06:43Z',
        },
        {
          id: 3318488,
          tag_name: 'v4.0.0',
          name: 'v4.0.0',
          draft: false,
          prerelease: false,
          created_at: '2021-09-15T01:05:43Z',
          published_at: '2021-09-15T01:05:43Z',
        },
        {
          id: 3318487,
          tag_name: 'v5.0.0-beta.1',
          name: 'v5.0.0-beta.1',
          draft: false,
          prerelease: false,
          created_at: '2021-09-11T23:53:07Z',
          published_at: '2021-09-11T23:53:07Z',
        },
      ]),
  )
  .expectBadge({ label: 'release', message: 'v2.0.0', color: 'blue' })
