import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('License redirect')
  .get('/gitlab-org/gitlab', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/gitlab/license/gitlab-org/gitlab.svg')
