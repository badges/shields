import { test, given } from 'sazerac'
import coalesce from './coalesce.js'

// Sticking with our one-line spread implementation, and defaulting to
// `undefined` instead of `null`, though h/t to
// https://github.com/royriojas/coalescy for these tests!

describe('coalesce', function () {
  test(coalesce, function () {
    given().expect(undefined)
    given(null, []).expect([])
    given(null, [], {}).expect([])
    given(null, undefined, 0, {}).expect(0)

    const a = null
    const c = 0
    const d = 1
    let b
    given(a, b, c, d).expect(0)
  })
})
