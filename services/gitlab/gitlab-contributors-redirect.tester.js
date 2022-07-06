import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Contributors redirect')
  .get('/gitlab-org/gitlab', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/gitlab/contributors/gitlab-org/gitlab.svg')
