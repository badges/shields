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

t.create('master build result (not found)')
  .get('/atlassian/not-a-repo/master.json')
  .expectBadge({ label: 'build', message: 'not found' })

t.create('branch build result (valid)')
  .get('/atlassian/adf-builder-javascript/shields-test-dont-remove.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('branch build result (not found)')
  .get('/atlassian/not-a-repo/some-branch.json')
  .expectBadge({ label: 'build', message: 'not found' })

t.create('branch build result (never built)')
  .get('/atlassian/adf-builder-javascript/some/new/branch.json')
  .expectBadge({ label: 'build', message: 'never built' })

t.create('build result (passing)')
  .get('/atlassian/adf-builder-javascript/master.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('SUCCESSFUL'))
  )
  .expectBadge({ label: 'build', message: 'passing' })

t.create('build result (failing)')
  .get('/atlassian/adf-builder-javascript/master.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('FAILED'))
  )
  .expectBadge({ label: 'build', message: 'failing' })

t.create('build result (error)')
  .get('/atlassian/adf-builder-javascript/master.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('ERROR'))
  )
  .expectBadge({ label: 'build', message: 'error' })

t.create('build result (stopped)')
  .get('/atlassian/adf-builder-javascript/master.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('STOPPED'))
  )
  .expectBadge({ label: 'build', message: 'stopped' })

t.create('build result (expired)')
  .get('/atlassian/adf-builder-javascript/master.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('EXPIRED'))
  )
  .expectBadge({ label: 'build', message: 'expired' })

t.create('build result (unexpected status)')
  .get('/atlassian/adf-builder-javascript/master.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('NEW_AND_UNEXPECTED'))
  )
  .expectBadge({ label: 'build', message: 'invalid response data' })

t.create('build result no branch redirect')
  .get('/atlassian/adf-builder-javascript.svg')
  .expectRedirect(
    '/bitbucket/pipelines/atlassian/adf-builder-javascript/master.svg'
  )
