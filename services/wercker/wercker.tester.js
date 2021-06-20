import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Build status')
  .get('/build/wercker/go-wercker-api.json')
  .expectBadge({ label: 'build', message: isBuildStatus })

t.create('Build status (with branch)')
  .get('/build/wercker/go-wercker-api/master.json')
  .expectBadge({ label: 'build', message: isBuildStatus })

t.create('Build status (application not found)')
  .get('/build/some-project/that-doesnt-exist.json')
  .expectBadge({ label: 'build', message: 'application not found' })

t.create('Build status (private application)')
  .get('/build/wercker/blueprint.json')
  .expectBadge({ label: 'build', message: 'private application not supported' })

t.create('Build passed')
  .get('/build/wercker/go-wercker-api.json')
  .intercept(nock =>
    nock('https://app.wercker.com/api/v3/applications/')
      .get('/wercker/go-wercker-api/builds?limit=1')
      .reply(200, [{ status: 'finished', result: 'passed' }])
  )
  .expectBadge({
    label: 'build',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('Build failed')
  .get('/build/wercker/go-wercker-api.json')
  .intercept(nock =>
    nock('https://app.wercker.com/api/v3/applications/')
      .get('/wercker/go-wercker-api/builds?limit=1')
      .reply(200, [{ status: 'finished', result: 'failed' }])
  )
  .expectBadge({ label: 'build', message: 'failing', color: 'red' })

t.create('CI status by ID')
  .get('/ci/559e33c8e982fc615500b357.json')
  .expectBadge({ label: 'build', message: isBuildStatus })

t.create('CI status by ID (with branch)')
  .get('/ci/559e33c8e982fc615500b357/master.json')
  .expectBadge({ label: 'build', message: isBuildStatus })

t.create('CI status by ID (no runs yet)')
  .get('/ci/559e33c8e982fc615500b357.json')
  .intercept(nock =>
    nock('https://app.wercker.com/api/v3')
      .get('/runs?applicationId=559e33c8e982fc615500b357&limit=1')
      .reply(200, [])
  )
  .expectBadge({ label: 'build', message: 'not built' })
