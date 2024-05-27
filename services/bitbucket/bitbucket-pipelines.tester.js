import { isBuildStatus } from '../build-status.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'BitbucketPipelines',
  title: 'Bitbucket Pipelines',
  pathPrefix: '/bitbucket/pipelines',
})

function bitbucketApiResponse(status) {
  return JSON.stringify({
    values: [
      {
        state: {
          type: 'pipeline_state_completed',
          name: 'COMPLETED',
          result: {
            type: 'pipeline_state_completed_xyz',
            name: status,
          },
        },
      },
    ],
  })
}

t.create('main build result (not found)')
  .get('/shields-io/not-a-repo/main.json')
  .expectBadge({ label: 'build', message: 'not found' })

t.create('branch build result (valid)')
  .get('/shields-io/test-repo/main.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('branch build result (not found)')
  .get('/shields-io/not-a-repo/some-branch.json')
  .expectBadge({ label: 'build', message: 'not found' })

t.create('branch build result (never built)')
  .get('/shields-io/test-repo/P-Y/update-readme-1704629121998.json')
  .expectBadge({ label: 'build', message: 'never built' })

t.create('build result (passing)')
  .get('/shields-io/test-repo/main.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('SUCCESSFUL')),
  )
  .expectBadge({ label: 'build', message: 'passing' })

t.create('build result (failing)')
  .get('/shields-io/test-repo/main.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('FAILED')),
  )
  .expectBadge({ label: 'build', message: 'failing' })

t.create('build result (error)')
  .get('/shields-io/test-repo/main.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('ERROR')),
  )
  .expectBadge({ label: 'build', message: 'error' })

t.create('build result (stopped)')
  .get('/shields-io/test-repo/main.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('STOPPED')),
  )
  .expectBadge({ label: 'build', message: 'stopped' })

t.create('build result (expired)')
  .get('/shields-io/test-repo/main.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('EXPIRED')),
  )
  .expectBadge({ label: 'build', message: 'expired' })

t.create('build result (unexpected status)')
  .get('/shields-io/test-repo/main.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('NEW_AND_UNEXPECTED')),
  )
  .expectBadge({ label: 'build', message: 'invalid response data' })

// regression test for https://github.com/badges/shields/issues/10137
t.create('build result (with manual build steps)')
  .get('/shields-io/test-repo/main.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, {
        values: [
          {
            state: {
              name: 'IN_PROGRESS',
              type: 'pipeline_state_in_progress',
              stage: {
                name: 'PAUSED',
                type: 'pipeline_state_in_progress_paused',
              },
            },
          },
          {
            state: {
              name: 'COMPLETED',
              type: 'pipeline_state_completed',
              result: {
                name: 'SUCCESSFUL',
                type: 'pipeline_state_completed_successful',
              },
            },
          },
        ],
      }),
  )
  .expectBadge({ label: 'build', message: 'passing' })

t.create('build result no branch redirect')
  .get('/shields-io/test-repo.svg')
  .expectRedirect('/bitbucket/pipelines/shields-io/test-repo/master.svg')
