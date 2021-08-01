import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('CI status')
  .timeout(10000)
  .get('/gruntjs/grunt.json')
  .expectBadge({ label: 'build', message: isBuildStatus })

t.create('CI status on branch')
  .timeout(10000)
  .get('/gruntjs/grunt/master.json')
  .expectBadge({ label: 'build', message: isBuildStatus })

t.create('CI status on nonexistent project')
  .timeout(10000)
  .get('/somerandomproject/thatdoesntexist.json')
  .expectBadge({
    label: 'build',
    message: 'project not found or access denied',
  })

t.create('CI status on project that does exist but has no builds yet')
  .get('/gruntjs/grunt.json')
  .intercept(nock =>
    nock('https://ci.appveyor.com/api/projects/')
      .get('/gruntjs/grunt')
      .reply(200, {})
  )
  .expectBadge({
    label: 'build',
    message: 'no builds found',
    color: 'lightgrey',
  })
