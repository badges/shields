import { isFileSize } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('bundlejs/package (packageName)')
  .get('/jquery.json')
  .expectBadge({ label: 'minified size (gzip)', message: isFileSize })

t.create('bundlejs/package (version)')
  .get('/react@18.2.0.json')
  .expectBadge({ label: 'minified size (gzip)', message: isFileSize })

t.create('bundlejs/package (scoped)')
  .get('/@cycle/rx-run.json')
  .expectBadge({ label: 'minified size (gzip)', message: isFileSize })

t.create('bundlejs/package (select exports)')
  .get('/value-enhancer/isVal,val.json')
  .expectBadge({ label: 'minified size (gzip)', message: isFileSize })

t.create('bundlejs/package (scoped version select exports)')
  .get('/@ngneat/falso@6.4.0/randEmail,randFullName.json')
  .expectBadge({ label: 'minified size (gzip)', message: isFileSize })

t.create('bundlejs/package (not found)')
  .get('/@some-no-exist/some-no-exist.json')
  .expectBadge({ label: 'bundlejs', message: 'package or version not found' })
