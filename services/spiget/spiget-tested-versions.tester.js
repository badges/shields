import { withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const multipleVersions = withRegex(/^([+]?\d*\.\d+)(-)([+]?\d*\.\d+)$/)

t.create('EssentialsX - multiple versions supported - (id 9089)')
  .get('/9089.json')
  .expectBadge({
    label: 'tested versions',
    message: multipleVersions,
  })

t.create('Invalid Resource (id 1)').get('/1.json').expectBadge({
  label: 'tested versions',
  message: 'not found',
})

t.create('Nock - single version supported')
  .get('/1.json')
  .intercept(nock =>
    nock('https://api.spiget.org/v2/resources/')
      .get('/1')
      .reply(200, {
        downloads: 1,
        file: {
          type: '.jar',
          size: 1,
          sizeUnit: '1',
        },
        testedVersions: ['1.13'],
        rating: {
          count: 1,
          average: 1,
        },
      })
  )
  .expectBadge({
    label: 'tested versions',
    message: '1.13',
  })

t.create('Nock - multiple versions supported')
  .get('/1.json')
  .intercept(nock =>
    nock('https://api.spiget.org/v2/resources/')
      .get('/1')
      .reply(200, {
        downloads: 1,
        file: {
          type: '.jar',
          size: 1,
          sizeUnit: '1',
        },
        testedVersions: ['1.10', '1.11', '1.12', '1.13'],
        rating: {
          count: 1,
          average: 1,
        },
      })
  )
  .expectBadge({
    label: 'tested versions',
    message: '1.10-1.13',
  })
