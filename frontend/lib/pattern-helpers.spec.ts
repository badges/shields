import { test, given } from 'sazerac'
import { patternToOptions, removeRegexpFromPattern } from './pattern-helpers'

describe('Badge URL functions', function () {
  test(patternToOptions, () => {
    given('[^\\/]+?').expect(undefined)
    given('abc|[^\\/]+').expect(undefined)
    given('abc|def|ghi').expect(['abc', 'def', 'ghi'])
  })

  test(removeRegexpFromPattern, () => {
    given('/appveyor/ci/:user/:repo').expect('/appveyor/ci/:user/:repo')
    given('/discourse/:scheme(http|https)/:host/topics').expect(
      '/discourse/:scheme/:host/topics'
    )
    given('/github/size/:user/:repo/:path*').expect(
      '/github/size/:user/:repo/:path*'
    )
    given('/microbadger/image-size/image-size/:imageId+').expect(
      '/microbadger/image-size/image-size/:imageId+'
    )
    given('/node/v/@:scope/:packageName').expect('/node/v/@:scope/:packageName')
    given('/ubuntu/v/:packageName/:series?').expect(
      '/ubuntu/v/:packageName/:series?'
    )
    given('/:foo/(.*)').expect('/:foo/(.*)')
  })
})
