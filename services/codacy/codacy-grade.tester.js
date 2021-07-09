import { createServiceTester } from '../tester.js'
import { codacyGrade } from './codacy-helpers.js'
export const t = await createServiceTester()

t.create('Code quality')
  .get('/e27821fb6289410b8f58338c7e0bc686.json')
  .expectBadge({
    label: 'code quality',
    message: codacyGrade,
  })

t.create('Code quality on branch')
  .get('/e27821fb6289410b8f58338c7e0bc686/master.json')
  .expectBadge({
    label: 'code quality',
    message: codacyGrade,
  })

t.create('Code quality (package not found)')
  .get('/00000000000000000000000000000000/master.json')
  .expectBadge({
    label: 'code quality',
    message: 'project or branch not found',
  })

// This is a known bug. The badge endpoint for a nonexistent branch returns
// the same result. It seems possible the branch specification isn't being
// considered at all.
// e.g.
// https://api.codacy.com/project/badge/grade/e27821fb6289410b8f58338c7e0bc686
// https://api.codacy.com/project/badge/grade/e27821fb6289410b8f58338c7e0bc686?branch=foo
// t.create('Code quality on branch (branch not found)')
//   .get('/grade/e27821fb6289410b8f58338c7e0bc686/not-a-branch.json')
//   .expectBadge({
//       label: 'code quality',
//       message: 'project or branch not found',
//   })
