import Joi from 'joi'
import { ServiceTester } from '../tester.js'
import { withRegex } from '../test-validators.js'

// same as isVPlusDottedVersionAtLeastOne, but also accepts an optional
// single lowercase alphabet letter suffix
// e.g.: v1.81a
const isVPlusDottedVersionAtLeastOneWithOptionalAlphabetLetter = withRegex(
  /^v\d+(\.\d+)?(\.\d+)?[a-z]?$/,
)

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
    nock('https://www.ctan.org')
      .get('/json/2.0/pkg/novel')
      .reply(200, {
        version: {
          number: 'notRelevant',
          date: 'notRelevant',
        },
      }),
  )
  .expectBadge({
    label: 'license',
    message: 'missing',
  })

t.create('single license')
  .get('/l/tex.json')
  .intercept(nock =>
    nock('https://www.ctan.org')
      .get('/json/2.0/pkg/tex')
      .reply(200, {
        license: 'knuth',
        version: {
          number: 'notRelevant',
          date: 'notRelevant',
        },
      }),
  )
  .expectBadge({
    label: 'license',
    message: 'knuth',
  })

t.create('version').get('/v/novel.json').expectBadge({
  label: 'ctan',
  message: isVPlusDottedVersionAtLeastOneWithOptionalAlphabetLetter,
})

t.create('version')
  .get('/v/novel.json')
  .intercept(nock =>
    nock('https://www.ctan.org')
      .get('/json/2.0/pkg/novel')
      .reply(200, {
        version: {
          number: 'v1.11',
          date: '',
        },
      }),
  )
  .expectBadge({
    label: 'ctan',
    message: 'v1.11',
    color: 'blue',
  })

t.create('date as version').get('/v/l3kernel.json').expectBadge({
  label: 'ctan',
  message: Joi.date().iso(),
  color: 'blue',
})
