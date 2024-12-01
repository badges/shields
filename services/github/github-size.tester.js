import { isIecFileSize } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('File size')
  .get('/webcaetano/craft/build/phaser-craft.min.js.json')
  .expectBadge({ label: 'size', message: isIecFileSize })

t.create('File size 404')
  .get('/webcaetano/craft/build/does-not-exist.min.js.json')
  .expectBadge({ label: 'size', message: 'repo or file not found' })

t.create('File size for nonexisting branch')
  .get('/webcaetano/craft/build/phaser-craft.min.js.json?branch=notARealBranch')
  .expectBadge({ label: 'size', message: 'repo, branch or file not found' })

t.create('File size for "not a regular file"')
  .get('/webcaetano/craft/build.json')
  .expectBadge({ label: 'size', message: 'not a regular file' })

t.create('File size for a specified branch')
  .get('/webcaetano/craft/build/craft.min.js.json?branch=version-2')
  .expectBadge({ label: 'size', message: isIecFileSize })

t.create('File size for a specified tag')
  .get('/webcaetano/craft/build/phaser-craft.min.js.json?branch=2.1.2')
  .expectBadge({ label: 'size', message: isIecFileSize })

t.create('File size for a specified commit')
  .get('/webcaetano/craft/build/phaser-craft.min.js.json?branch=b848dbb')
  .expectBadge({ label: 'size', message: isIecFileSize })
