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
    '/totodem/Shields.io/5.json?stage=Successful%20Stage&job=Successful%20Job'
  )
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('never built definition')
  .get('/swellaby/opensource/112.json')
  .expectBadge({ label: 'build', message: 'never built' })

t.create('unknown definition')
  .get('/larsbrinkhoff/953a34b9-5966-4923-a48a-c41874cfb5f5/515.json')
  .expectBadge({ label: 'build', message: 'definition not found' })

t.create('unknown project')
  .get('/larsbrinkhoff/foo/515.json')
  .expectBadge({ label: 'build', message: 'user or project not found' })

t.create('unknown user')
  .get('/notarealuser/foo/515.json')
  .expectBadge({ label: 'build', message: 'user or project not found' })

// The following build definition has always a partially succeeded status
t.create('partially succeeded build')
  .get('/totodem/shields.io/4/master.json')
  .expectBadge({ label: 'build', message: 'passing', color: 'orange' })
