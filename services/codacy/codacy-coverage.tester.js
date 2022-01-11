import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// https://app.codacy.com/gh/kronenthaler/openstep-parser/dashboard
// https://github.com/kronenthaler/openstep-parser
t.create('Coverage').get('/d5402a91aa7b4234bd1c19b5e86a63be.json').expectBadge({
  label: 'coverage',
  message: isIntegerPercentage,
})

t.create('Coverage on branch')
  .get('/d5402a91aa7b4234bd1c19b5e86a63be/master.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage not enabled')
  .get('/0cb32ce695b743d68257021455330c66.json')
  .expectBadge({
    label: 'coverage',
    message: 'not enabled for this project',
  })

t.create('Coverage (project not found)')
  .get('/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.json')
  .expectBadge({
    label: 'coverage',
    message: 'project not found',
  })
