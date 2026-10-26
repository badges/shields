import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('build status (passing)')
  .get('/acme/cool-project.json?token=fake-token')
  .intercept(nock =>
    nock('https://api.buddy.works')
      .get('/workspaces/acme/projects/cool-project/executions')
      .matchHeader('Authorization', 'Bearer fake-token')
      .reply(200, { executions: [{ status: 'SUCCESSFUL' }] }),
  )
  .expectBadge({ label: 'build', message: 'passing', color: 'brightgreen' })

t.create('build status (failing)')
  .get('/acme/cool-project.json?token=fake-token')
  .intercept(nock =>
    nock('https://api.buddy.works')
      .get('/workspaces/acme/projects/cool-project/executions')
      .matchHeader('Authorization', 'Bearer fake-token')
      .reply(200, { executions: [{ status: 'FAILED' }] }),
  )
  .expectBadge({ label: 'build', message: 'failing', color: 'red' })

t.create('build status (enqueued)')
  .get('/acme/cool-project.json?token=fake-token')
  .intercept(nock =>
    nock('https://api.buddy.works')
      .get('/workspaces/acme/projects/cool-project/executions')
      .reply(200, { executions: [{ status: 'ENQUEUED' }] }),
  )
  .expectBadge({ label: 'build', message: 'pending' })

t.create('build status (in progress)')
  .get('/acme/cool-project.json?token=fake-token')
  .intercept(nock =>
    nock('https://api.buddy.works')
      .get('/workspaces/acme/projects/cool-project/executions')
      .reply(200, { executions: [{ status: 'INPROGRESS' }] }),
  )
  .expectBadge({ label: 'build', message: 'pending' })

t.create('build status (no executions)')
  .get('/acme/cool-project.json?token=fake-token')
  .intercept(nock =>
    nock('https://api.buddy.works')
      .get('/workspaces/acme/projects/cool-project/executions')
      .reply(200, { executions: [] }),
  )
  .expectBadge({ label: 'build', message: 'pending' })

t.create('build status (invalid token)')
  .get('/acme/cool-project.json?token=fake-token')
  .intercept(nock =>
    nock('https://api.buddy.works')
      .get('/workspaces/acme/projects/cool-project/executions')
      .reply(401),
  )
  .expectBadge({ label: 'build', message: 'invalid token' })

t.create('build status (project not found)')
  .get('/acme/not-a-real-project.json?token=fake-token')
  .intercept(nock =>
    nock('https://api.buddy.works')
      .get('/workspaces/acme/projects/not-a-real-project/executions')
      .reply(404),
  )
  .expectBadge({ label: 'build', message: 'project not found' })

t.create('build status (branch)')
  .get('/acme/cool-project/main.json?token=fake-token')
  .intercept(nock =>
    nock('https://api.buddy.works')
      .get('/workspaces/acme/projects/cool-project/executions')
      .query({ branch: 'main' })
      .matchHeader('Authorization', 'Bearer fake-token')
      .reply(200, { executions: [{ status: 'SUCCESSFUL' }] }),
  )
  .expectBadge({ label: 'build', message: 'passing', color: 'brightgreen' })
