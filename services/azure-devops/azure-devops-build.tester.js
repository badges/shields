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

t.create('never built definition')
  .get('/swellaby/opensource/112.json')
  .expectBadge({ label: 'build', message: 'never built' })

t.create('unknown user or project')
  .get('/notarealuser/foo/515.json')
  .expectBadge({ label: 'build', message: 'user or project not found' })

// The Azure DevOps build REST API returns the same response for a missing
// definition as for a missing project/user (a redirect to sign-in), so unlike
// the old status-image endpoint the build badge cannot distinguish
// 'definition not found'. The 404 path is consolidated into
// 'user or project not found', consistent with the sibling Azure DevOps
// badges; a missing definition under an accessible project returns zero builds
// and renders 'never built' (see above).
t.create('404 latest build error response')
  .get('/swellaby/fake/14.json')
  .intercept(nock =>
    nock('https://dev.azure.com/swellaby/fake/_apis')
      .get('/build/builds')
      .query({
        definitions: 14,
        $top: 1,
        statusFilter: 'completed',
        'api-version': '5.0-preview.4',
      })
      .reply(404),
  )
  .expectBadge({ label: 'build', message: 'user or project not found' })

// The following build definition has always a partially succeeded status
t.create('partially succeeded build')
  .get('/totodem/shields.io/4/master.json')
  .expectBadge({ label: 'build', message: 'passing', color: 'orange' })
