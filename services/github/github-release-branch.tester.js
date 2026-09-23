import Joi from 'joi'
import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Release by branch (valid)')
  .get('/laravel/framework/13.x.json')
  .expectBadge({
    label: 'latest-release@13.x',
    message: isSemver,
    color: 'blue',
  })

t.create('Release by branch (valid, mocked)')
  .get('/user/repo/main.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/user/repo/releases')
      .query({ per_page: 100, page: 1 })
      .reply(200, [
        {
          tag_name: 'v2.0.0',
          target_commitish: 'main',
          prerelease: false,
          name: '',
        },
      ]),
  )
  .expectBadge({
    label: 'latest-release@main',
    message: 'v2.0.0',
    color: 'blue',
  })

t.create('Release by branch (prerelease, mocked)')
  .get('/user/repo/main.json?include_prereleases')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/user/repo/releases')
      .query({ per_page: 100, page: 1 })
      .reply(200, [
        {
          tag_name: 'v2.0.0-beta',
          target_commitish: 'main',
          prerelease: true,
          name: '',
        },
      ]),
  )
  .expectBadge({
    label: 'latest-release@main',
    message: 'v2.0.0-beta',
    color: 'orange',
  })

t.create('Release by branch (paginated, mocked)')
  .get('/user/repo/1.x.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/user/repo/releases')
      .query({ per_page: 100, page: 1 })
      .reply(200, [
        {
          tag_name: 'v2.0.0',
          target_commitish: 'main',
          prerelease: false,
          name: '',
        },
      ])
      .get('/repos/user/repo/releases')
      .query({ per_page: 100, page: 2 })
      .reply(200, [
        {
          tag_name: 'v1.0.0',
          target_commitish: '1.x',
          prerelease: false,
          name: '',
        },
      ]),
  )
  .expectBadge({
    label: 'latest-release@1.x',
    message: 'v1.0.0',
    color: 'blue',
  })

t.create('Release by branch (no matching branch, mocked)')
  .get('/user/repo/2.x.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/user/repo/releases')
      .query({ per_page: 100, page: 1 })
      .reply(200, [
        {
          tag_name: 'v1.0.0',
          target_commitish: '1.x',
          prerelease: false,
          name: '',
        },
      ])
      .get('/repos/user/repo/releases')
      .query({ per_page: 100, page: 2 })
      .reply(200, []),
  )
  .expectBadge({
    label: 'latest-release',
    message: 'no release found for branch',
  })

t.create('Release by branch (repo not found)')
  .get('/badges/helmets/1.x.json')
  .expectBadge({ label: 'latest-release', message: 'repo not found' })

t.create('Release by branch (no releases, mocked)')
  .get('/user/repo/main.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/user/repo/releases')
      .query({ per_page: 100, page: 1 })
      .reply(200, []),
  )
  .expectBadge({ label: 'latest-release', message: 'no releases found' })

t.create('Release by branch (prerelease excluded, mocked)')
  .get('/user/repo/main.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/user/repo/releases')
      .query({ per_page: 100, page: 1 })
      .reply(200, [
        {
          tag_name: 'v2.0.0-beta',
          target_commitish: 'main',
          prerelease: true,
          name: '',
        },
      ])
      .get('/repos/user/repo/releases')
      .query({ per_page: 100, page: 2 })
      .reply(200, []),
  )
  .expectBadge({
    label: 'latest-release',
    message: 'no release found for branch',
  })

t.create('Release by branch (stable after prerelease, mocked)')
  .get('/user/repo/main.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/user/repo/releases')
      .query({ per_page: 100, page: 1 })
      .reply(200, [
        {
          tag_name: 'v2.0.0-beta',
          target_commitish: 'main',
          prerelease: true,
          name: '',
        },
        {
          tag_name: 'v2.0.0',
          target_commitish: 'main',
          prerelease: false,
          name: '',
        },
      ]),
  )
  .expectBadge({
    label: 'latest-release@main',
    message: 'v2.0.0',
    color: 'blue',
  })

t.create('Release by branch (prerelease color)')
  .get('/laravel/framework/13.x.json?include_prereleases')
  .expectBadge({
    label: 'latest-release@13.x',
    message: isSemver,
    color: Joi.equal('blue', 'orange').required(),
  })
