import { isMetricFileSize } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('bundlejs/package (packageName)')
  .get('/jquery.json')
  .expectBadge({ label: 'minified size (gzip)', message: isMetricFileSize })

t.create('bundlejs/package (version)')
  .get('/react@18.2.0.json')
  .expectBadge({ label: 'minified size (gzip)', message: isMetricFileSize })

t.create('bundlejs/package (scoped)')
  .get('/@cycle/rx-run.json')
  .expectBadge({ label: 'minified size (gzip)', message: isMetricFileSize })

t.create('bundlejs/package (select exports)')
  .get('/value-enhancer.json?exports=isVal,val')
  .expectBadge({ label: 'minified size (gzip)', message: isMetricFileSize })

t.create('bundlejs/package (scoped version select exports)')
  .get('/@ngneat/falso@6.4.0.json?exports=randEmail,randFullName')
  .expectBadge({ label: 'minified size (gzip)', message: isMetricFileSize })

t.create('bundlejs/package (not found)')
  .get('/react@18.2.0.json')
  .intercept(nock =>
    nock('https://deno.bundlejs.com')
      .get(/./)
      .query({ q: 'react@18.2.0' })
      .reply(404),
  )
  .expectBadge({ label: 'bundlejs', message: 'package or version not found' })

t.create('bundlejs/package (timeout)')
  .get('/react@18.2.0.json')
  .intercept(nock =>
    nock('https://deno.bundlejs.com')
      .get(/./)
      .query({ q: 'react@18.2.0' })
      .replyWithError({ code: 'ETIMEDOUT' }),
  )
  .expectBadge({ label: 'bundlejs', message: 'timeout' })
