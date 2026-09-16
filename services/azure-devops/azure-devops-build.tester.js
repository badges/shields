import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// https://dev.azure.com/totodem/Shields.io is a public Azure DevOps project
// solely created for Shields.io testing.

t.create('default branch').get('/totodem/shields.io/2.json').expectBadge({
  label: 'build',
  message: isBuildStatus,
})

t.create('named branch').get('/totodem/shields.io/2/master.json').expectBadge({
  label: 'build',
  message: isBuildStatus,
})

t.create('stage badge')
  .get('/totodem/Shields.io/5.json?stage=Successful%20Stage')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('job badge')
  .get(
    '/totodem/Shields.io/5.json?stage=Successful%20Stage&job=Successful%20Job',
  )
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

// A pipeline that exists but has no completed builds, and a bad org/project,
// both surface as 'build pipeline not found' — consistent with the sibling
// Azure DevOps badges (coverage, tests).
t.create('unknown build definition')
  .get('/swellaby/opensource/112.json')
  .expectBadge({ label: 'build', message: 'build pipeline not found' })

t.create('unknown user or project')
  .get('/notarealuser/foo/515.json')
  .expectBadge({ label: 'build', message: 'build pipeline not found' })

// The following build definition has always a partially succeeded status
t.create('partially succeeded build')
  .get('/totodem/shields.io/4/master.json')
  .expectBadge({ label: 'build', message: 'passing', color: 'orange' })

// Overall build is `succeeded` but the requested stage `failed` — the badge
// must reflect the stage, proving the Timeline lookup is used.
t.create('stage status reflects the stage, not the overall build')
  .get('/totodem/someproject/5.json?stage=Failing%20Stage')
  .intercept(nock =>
    nock('https://dev.azure.com/totodem/someproject/_apis')
      .get('/build/builds')
      .query({
        definitions: 5,
        $top: 1,
        statusFilter: 'completed',
        'api-version': '5.0-preview.4',
      })
      .reply(200, {
        count: 1,
        value: [{ id: 999, status: 'completed', result: 'succeeded' }],
      })
      .get('/build/builds/999/timeline')
      .reply(200, {
        records: [
          { type: 'Stage', name: 'Successful Stage', result: 'succeeded' },
          { type: 'Stage', name: 'Failing Stage', result: 'failed' },
        ],
      }),
  )
  .expectBadge({ label: 'build', message: 'failing', color: 'red' })

// A job takes precedence over a stage, and timeline `succeededWithIssues`
// maps to the orange partially-succeeded badge.
t.create('job status (succeededWithIssues -> partially succeeded)')
  .get('/totodem/someproject/5.json?stage=Successful%20Stage&job=Flaky%20Job')
  .intercept(nock =>
    nock('https://dev.azure.com/totodem/someproject/_apis')
      .get('/build/builds')
      .query({
        definitions: 5,
        $top: 1,
        statusFilter: 'completed',
        'api-version': '5.0-preview.4',
      })
      .reply(200, {
        count: 1,
        value: [{ id: 999, status: 'completed', result: 'succeeded' }],
      })
      .get('/build/builds/999/timeline')
      .reply(200, {
        records: [
          { type: 'Job', name: 'Flaky Job', result: 'succeededWithIssues' },
        ],
      }),
  )
  .expectBadge({ label: 'build', message: 'passing', color: 'orange' })

t.create('unknown stage')
  .get('/totodem/someproject/5.json?stage=Nonexistent%20Stage')
  .intercept(nock =>
    nock('https://dev.azure.com/totodem/someproject/_apis')
      .get('/build/builds')
      .query({
        definitions: 5,
        $top: 1,
        statusFilter: 'completed',
        'api-version': '5.0-preview.4',
      })
      .reply(200, {
        count: 1,
        value: [{ id: 999, status: 'completed', result: 'succeeded' }],
      })
      .get('/build/builds/999/timeline')
      .reply(200, {
        records: [{ type: 'Stage', name: 'Other Stage', result: 'succeeded' }],
      }),
  )
  .expectBadge({ label: 'build', message: 'stage not found' })
