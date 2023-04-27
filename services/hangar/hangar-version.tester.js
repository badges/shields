import { isVPlusDottedVersionNClausesWithOptionalSuffix } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Essentials (project EssentialsX/Essentials)')
  .get('/EssentialsX/Essentials.json')
  .expectBadge({
    label: 'version',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('HuskHomes (project William278/HuskHomes)')
  .get('/William278/HuskHomes.json')
  .expectBadge({
    label: 'version',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('HuskHomes Alpha Releases (project William278/HuskHomes)')
  .get('/William278/HuskHomes/Alpha.json')
  .expectBadge({
    label: 'version',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('Invalid Project (project md5lukas/invalid)')
  .get('/md5lukas/invalid.json')
  .expectBadge({
    label: 'version',
    message: 'not found',
  })
