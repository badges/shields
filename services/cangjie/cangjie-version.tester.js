import { isVPlusDottedVersionNClausesWithOptionalSuffix as isVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('live cangjie version unicode_case')
  .get('/unicode_case.json')
  .expectBadge({
    label: 'cangjie',
    message: isVersion,
  })

t.create('live cangjie version organization')
  .get('/f_store.json?organization=fountain')
  .expectBadge({
    label: 'cangjie',
    message: isVersion,
  })

t.create('version')
  .get('/stdx.json')
  .intercept(nock =>
    nock('https://pkg.cangjie-lang.cn')
      .get('/registry/index/st/dx/stdx')
      .reply(
        200,
        [
          '{"name":"stdx","version":"0.0.1","yanked":false,"index-version":"1"}',
          '{"name":"stdx","version":"0.0.3","yanked":false,"index-version":"1"}',
          '{"name":"stdx","version":"0.0.2","yanked":false,"index-version":"1"}',
        ].join('\n'),
      ),
  )
  .expectBadge({ label: 'cangjie', message: 'v0.0.3' })

t.create('version (organization)')
  .get('/f_store.json?organization=fountain')
  .intercept(nock =>
    nock('https://pkg.cangjie-lang.cn')
      .get('/registry/index/f_/st/f_store')
      .query({ organization: 'fountain' })
      .reply(
        200,
        '{"organization":"fountain","name":"f_store","version":"1.1.2","yanked":false,"index-version":"1"}',
      ),
  )
  .expectBadge({ label: 'cangjie', message: 'v1.1.2' })

t.create('version ignores yanked releases')
  .get('/demo.json')
  .intercept(nock =>
    nock('https://pkg.cangjie-lang.cn')
      .get('/registry/index/de/mo/demo')
      .reply(
        200,
        [
          '{"name":"demo","version":"1.0.0","yanked":false,"index-version":"1"}',
          '{"name":"demo","version":"1.1.0","yanked":true,"index-version":"1"}',
        ].join('\n'),
      ),
  )
  .expectBadge({ label: 'cangjie', message: 'v1.0.0' })

t.create('version (invalid module name)')
  .get('/ab.json')
  .expectBadge({ label: 'cangjie', message: 'invalid module name' })

t.create('version (unparseable jsonl response)')
  .get('/stdx.json')
  .intercept(nock =>
    nock('https://pkg.cangjie-lang.cn')
      .get('/registry/index/st/dx/stdx')
      .reply(200, 'not json'),
  )
  .expectBadge({ label: 'cangjie', message: 'unparseable jsonl response' })

t.create('version (invalid index entry)')
  .get('/stdx.json')
  .intercept(nock =>
    nock('https://pkg.cangjie-lang.cn')
      .get('/registry/index/st/dx/stdx')
      .reply(200, '{"name":"stdx","version":"0.0.1","index-version":"1"}'),
  )
  .expectBadge({ label: 'cangjie', message: 'invalid index entry' })

t.create('version (not found)')
  .get('/not-a-real-package.json')
  .intercept(nock =>
    nock('https://pkg.cangjie-lang.cn')
      .get('/registry/index/no/t-/not-a-real-package')
      .reply(404),
  )
  .expectBadge({ label: 'cangjie', message: 'not found' })
