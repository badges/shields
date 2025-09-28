import { createServiceTester } from '../tester.js'
import { isValidGrade } from './codefactor-helpers.js'
export const t = await createServiceTester()

t.create('Grade').get('/github/microsoft/powertoys.json').expectBadge({
  label: 'code quality',
  message: isValidGrade,
})

t.create('Grade (branch)')
  .get('/github/microsoft/powertoys/main.json')
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
