import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Coverage redirect (with branch)')
  .get('/gitlab-org/gitlab-runner/master.json')
  .expectRedirect(
    '/gitlab/pipeline-coverage/gitlab-org/gitlab-runner.json?branch=master',
  )

t.create('Coverage redirect (with branch and job_name)')
  .get('/gitlab-org/gitlab-runner/master.json?job_name=test coverage report')
  .expectRedirect(
    '/gitlab/pipeline-coverage/gitlab-org/gitlab-runner.json?branch=master&job_name=test%20coverage%20report',
  )

t.create('Coverage redirect (with branch and gitlab_url)')
  .get(
    '/gitlab-org/gitlab-runner/master.json?gitlab_url=https://gitlab.gnome.org',
  )
  .expectRedirect(
    '/gitlab/pipeline-coverage/gitlab-org/gitlab-runner.json?branch=master&gitlab_url=https%3a%2f%2fgitlab.gnome.org',
  )
