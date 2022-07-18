import { isVPlusTripleDottedVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('version').get('/v/conda-forge/zlib.json').expectBadge({
  label: 'conda|conda-forge',
  message: isVPlusTripleDottedVersion,
})

t.create('version (skip prefix)').get('/vn/conda-forge/zlib.json').expectBadge({
  label: 'conda-forge',
  message: isVPlusTripleDottedVersion,
})
