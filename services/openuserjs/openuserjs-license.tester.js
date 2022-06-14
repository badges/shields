import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('License (valid)')
  .get('/l/NatoBoram/YouTube_Comment_Blacklist.json')
  .expectBadge({
    label: 'license',
    message: 'GPL-3.0-or-later',
  })

t.create('License (not found)')
  .get('/l/NotAUser/NotAScript.json')
  .expectBadge({ label: 'license', message: 'invalid' })
