import { expect } from 'chai'
import { test, given } from 'sazerac'
import { findCategory, getDefinitionsForCategory } from '.'

describe('Service definition helpers', function () {
  test(findCategory, () => {
    given('build').expect({ id: 'build', name: 'Build', keywords: ['build'] })
    given('foo').expect(undefined)
  })

  it('getDefinitionsForCategory', function () {
    expect(getDefinitionsForCategory('build'))
      .to.have.length.greaterThan(10)
      .and.lessThan(75)
  })
})
