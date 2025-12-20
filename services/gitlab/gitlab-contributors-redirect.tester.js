import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Contributors deprecated').get('/gitlab-org/gitlab.json').expectBadge({
  label: 'gitlab',
  message: 'https://github.com/badges/shields/pull/11583',
})
