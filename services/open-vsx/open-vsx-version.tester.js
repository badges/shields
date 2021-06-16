import {createServiceTester} from '../tester.js'
export const t = await createServiceTester()
import {withRegex} from '../test-validators.js';

const isVersion = withRegex(/^v(\d+\.\d+\.\d+)(\.\d+)?$/)

t.create('version invalid extension')
  .get('/v/badges/shields.json')
  .expectBadge({
    label: 'open vsx',
    message: 'extension not found',
  })

t.create('version').get('/v/redhat/java.json').expectBadge({
  label: 'open vsx',
  message: isVersion,
})
