import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Snapcraft license (valid)').get('/redis.json').expectBadge({
  label: 'license',
  message: 'BSD-3-Clause',
})

t.create('Snapcraft license(invalid)')
  .get('/this_package_doesnt_exist.json')
  .expectBadge({
    label: 'license',
    message: 'package not found',
  })
