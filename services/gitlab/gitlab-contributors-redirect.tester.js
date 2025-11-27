import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Contributors redirect')
  .get('/gitlab-org/gitlab')
  .expectRedirect('/gitlab/contributors/gitlab-org/gitlab.svg')
