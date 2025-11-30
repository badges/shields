import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('License redirect')
  .get('/gitlab-org/gitlab')
  .expectRedirect('/gitlab/license/gitlab-org/gitlab.svg')
