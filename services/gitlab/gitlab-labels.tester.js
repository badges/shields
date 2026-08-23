import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Label Unit Test')
  .get('/gitlab-org/gitlab/bug.json')
  .expectBadge({
    message: 'bug',
    color: '#6699cc',
    link: [
      'https://gitlab.com/gitlab-org/gitlab',
      encodeURI(
        `https://gitlab.com/gitlab-org/gitlab/-/work-items?label_name[]=bug`,
      ),
    ],
  })

t.create('Label (self-managed)')
  .get('/gitlab-cn/gitlab/type::bug.json?gitlab_url=https://jihulab.com')
  .expectBadge({
    message: 'type::bug',
    color: '#ff0000',
    link: [
      'https://jihulab.com/gitlab-cn/gitlab',
      encodeURI(
        `https://jihulab.com/gitlab-cn/gitlab/-/work_items?label_name[]=type::bug`,
      ),
    ],
  })

t.create('Label (project not found)')
  .get('/user1/gitlab-does-not-have-this-repo/bug.json')
  .expectBadge({
    message: 'project not found',
  })
