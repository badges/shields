import { expect } from 'chai'
import deprecatedService from './deprecated-service.js'

describe('DeprecatedService', function () {
  const route = {
    base: 'service/that/no/longer/exists',
    format: '(?:.+)',
  }
  const category = 'analysis'
  const dateAdded = new Date()
  const commonAttrs = { route, category, dateAdded }

  it('returns true on isDeprecated', function () {
    const service = deprecatedService({ ...commonAttrs })
    expect(service.isDeprecated).to.be.true
  })

  it('has the expected name', function () {
    const service = deprecatedService({ ...commonAttrs })
    expect(service.name).to.equal('DeprecatedServiceThatNoLongerExists')
  })

  it('sets specified route', function () {
    const service = deprecatedService({ ...commonAttrs })
    expect(service.route).to.deep.equal(route)
  })

  it('sets specified label', function () {
    const label = 'coverity'
    const service = deprecatedService({ ...commonAttrs, label })
    expect(service.defaultBadgeData.label).to.equal(label)
  })

  it('sets specified category', function () {
    const service = deprecatedService({ ...commonAttrs })
    expect(service.category).to.equal(category)
  })

  it('sets default deprecation message', async function () {
    const service = deprecatedService({ ...commonAttrs })
    expect(await service.invoke()).to.deep.equal({
      message: 'no longer available',
    })
  })

  it('sets default deprecation color', async function () {
    const service = deprecatedService({ ...commonAttrs })
    expect(service.defaultBadgeData.color).to.equal('lightgray')
  })

  it('sets specified issue URL and sets red color', async function () {
    const service = deprecatedService({
      ...commonAttrs,
      issueUrl: 'https://github.com/badges/shields/issues/8671',
    })
    expect(service.defaultBadgeData.color).to.equal('red')
    expect(await service.invoke()).to.deep.equal({
      message: 'https://github.com/badges/shields/issues/8671',
      link: ['https://github.com/badges/shields/issues/8671'],
    })
  })
})
