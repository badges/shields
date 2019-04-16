import { expect } from 'chai'
import { test, given } from 'sazerac'
import {
  findCategory,
  getDefinitionsForCategory,
  getExampleWithServiceByPattern,
} from './index'

describe('Service definition helpers', function() {
  test(findCategory, () => {
    given('build').expect({ id: 'build', name: 'Build' })
    given('foo').expect(undefined)
  })

  describe('getExampleWithServiceByPattern', function() {
    it('returns example with service', function() {
      const result = getExampleWithServiceByPattern('/travis/:user/:repo')

      expect(result.example.title).to.equal('Travis (.org)')
      expect(result.service.name).to.equal('TravisBuild')
    })

    it('returns undefined when there is no example with given patten', function() {
      const result = getExampleWithServiceByPattern(
        '/unknown-pattern/:user/:repo'
      )

      expect(result).to.be.undefined
    })
  })

  it('getDefinitionsForCategory', function() {
    expect(getDefinitionsForCategory('build'))
      .to.have.length.greaterThan(10)
      .and.lessThan(50)
  })
})
