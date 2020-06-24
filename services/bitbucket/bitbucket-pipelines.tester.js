'use strict'

const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

function bitbucketPipelineApiResponse(status) {
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

t.create('master build result (valid)')
  .get('/atlassian/adf-builder-javascript.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('master build result (not found)')
  .get('/atlassian/not-a-repo.json')
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

t.create('build result (default branch is not called master)')
  .get('/chris48s/no-master-branch.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('build result (passing)')
  .get('/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get('/2.0/repositories/atlassian/adf-builder-javascript/')
      .reply(200, { mainbranch: { name: 'master' } })
  )
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(
        /^\/2.0\/repositories\/atlassian\/adf-builder-javascript\/pipelines.*/
      )
      .reply(200, bitbucketPipelineApiResponse('SUCCESSFUL'))
  )
  .expectBadge({ label: 'build', message: 'passing' })

t.create('build result (failing)')
  .get('/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get('/2.0/repositories/atlassian/adf-builder-javascript/')
      .reply(200, { mainbranch: { name: 'master' } })
  )
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(
        /^\/2.0\/repositories\/atlassian\/adf-builder-javascript\/pipelines.*/
      )
      .reply(200, bitbucketPipelineApiResponse('FAILED'))
  )
  .expectBadge({ label: 'build', message: 'failing' })

t.create('build result (error)')
  .get('/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get('/2.0/repositories/atlassian/adf-builder-javascript/')
      .reply(200, { mainbranch: { name: 'master' } })
  )
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(
        /^\/2.0\/repositories\/atlassian\/adf-builder-javascript\/pipelines.*/
      )
      .reply(200, bitbucketPipelineApiResponse('ERROR'))
  )
  .expectBadge({ label: 'build', message: 'error' })

t.create('build result (stopped)')
  .get('/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get('/2.0/repositories/atlassian/adf-builder-javascript/')
      .reply(200, { mainbranch: { name: 'master' } })
  )
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(
        /^\/2.0\/repositories\/atlassian\/adf-builder-javascript\/pipelines.*/
      )
      .reply(200, bitbucketPipelineApiResponse('STOPPED'))
  )
  .expectBadge({ label: 'build', message: 'stopped' })

t.create('build result (expired)')
  .get('/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get('/2.0/repositories/atlassian/adf-builder-javascript/')
      .reply(200, { mainbranch: { name: 'master' } })
  )
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(
        /^\/2.0\/repositories\/atlassian\/adf-builder-javascript\/pipelines.*/
      )
      .reply(200, bitbucketPipelineApiResponse('EXPIRED'))
  )
  .expectBadge({ label: 'build', message: 'expired' })

t.create('build result (unexpected status)')
  .get('/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get('/2.0/repositories/atlassian/adf-builder-javascript/')
      .reply(200, { mainbranch: { name: 'master' } })
  )
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(
        /^\/2.0\/repositories\/atlassian\/adf-builder-javascript\/pipelines.*/
      )
      .reply(200, bitbucketPipelineApiResponse('NEW_AND_UNEXPECTED'))
  )
  .expectBadge({ label: 'build', message: 'invalid response data' })
