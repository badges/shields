import { test, given } from 'sazerac'
import { patternToOptions } from './pattern-helpers'

describe('Badge URL functions', function() {
  test(patternToOptions, () => {
    given('[^\\/]+?').expect(undefined)
    given('abc|[^\\/]+').expect(undefined)
    given('abc|def|ghi').expect(['abc', 'def', 'ghi'])
  })
})
