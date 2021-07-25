import { createServiceTester } from '../tester.js'
import { isValidGrade } from './codefactor-helpers.js'
export const t = await createServiceTester()

t.create('Grade').get('/github/google/guava.json').expectBadge({
  label: 'code quality',
  message: isValidGrade,
})

t.create('Grade (branch)')
  .get('/github/pallets/flask/master.json')
  .expectBadge({
    label: 'code quality',
    message: isValidGrade,
  })

t.create('Grade (nonexistent repo)')
  .get('/github/badges/asdfasdfasdfasdfasfae.json')
  .expectBadge({
    label: 'code quality',
    message: 'repo or branch not found',
  })
