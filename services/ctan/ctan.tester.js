import { ServiceTester } from '../tester.js'
import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'ctan',
  title: 'Comprehensive TEX Archive Network',
})

t.create('license').get('/l/novel.json').expectBadge({
  label: 'license',
  message: 'lppl1.3c, ofl',
})

t.create('license missing')
  .get('/l/novel.json')
  .intercept(nock =>
    nock('http://www.ctan.org')
      .get('/json/pkg/novel')
      .reply(200, {
        version: {
          number: 'notRelevant',
        },
      })
  )
  .expectBadge({
    label: 'license',
    message: 'missing',
  })

t.create('single license')
  .get('/l/tex.json')
  .intercept(nock =>
    nock('http://www.ctan.org')
      .get('/json/pkg/tex')
      .reply(200, {
        license: 'knuth',
        version: {
          number: 'notRelevant',
        },
      })
  )
  .expectBadge({
    label: 'license',
    message: 'knuth',
  })

t.create('version').get('/v/novel.json').expectBadge({
  label: 'ctan',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('version')
  .get('/v/novel.json')
  .intercept(nock =>
    nock('http://www.ctan.org')
      .get('/json/pkg/novel')
      .reply(200, {
        version: {
          number: 'v1.11',
        },
      })
  )
  .expectBadge({
    label: 'ctan',
    message: 'v1.11',
    color: 'blue',
  })
