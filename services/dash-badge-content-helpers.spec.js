import { test, given } from 'sazerac'
import { splitDashSeparatedOptionalParams } from './dash-badge-content-helpers.js'

describe('Dash badge content helpers', function () {
  test(splitDashSeparatedOptionalParams, () => {
    given('foo-bar-baz').expect(['foo', 'bar', 'baz'])
    given('foo--bar-baz').expect(['foo-bar', 'baz'])
    given('foo-bar--baz').expect(['foo', 'bar-baz'])
    given('foo--bar--baz').expect(['foo-bar-baz'])
    given('foo//bar-baz').expect(['foo/bar', 'baz'])
    given('foo//bar//baz').expect(['foo/bar/baz'])
  })
})
