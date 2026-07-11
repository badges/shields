import { expect } from 'chai'
import retiredService from './retired-service.js'

describe('RetiredService', function () {
  const route = {
    base: 'service/that/no/longer/exists',
    pattern: ':various+',
  }
  const category = 'analysis'
  const dateAdded = new Date()
  const commonAttrs = { route, category, dateAdded }

  it('returns true on isRetired', function () {
    const service = retiredService({ ...commonAttrs })
    expect(service.isRetired).to.be.true
  })

  it('has the expected name', function () {
    const service = retiredService({ ...commonAttrs })
    expect(service.name).to.equal('RetiredServiceThatNoLongerExists')
  })

  it('sets specified route', function () {
    const service = retiredService({ ...commonAttrs })
    expect(service.route).to.deep.equal(route)
  })

  it('sets specified label', function () {
    const label = 'coverity'
    const service = retiredService({ ...commonAttrs, label })
    expect(service.defaultBadgeData.label).to.equal(label)
  })

  it('sets specified category', function () {
    const service = retiredService({ ...commonAttrs })
    expect(service.category).to.equal(category)
  })

  it('sets default deprecation message', async function () {
    const service = retiredService({ ...commonAttrs })
    expect(await service.invoke()).to.deep.equal({
      message: 'retired badge',
    })
  })

  it('sets default deprecation color', async function () {
    const service = retiredService({ ...commonAttrs })
    expect(service.defaultBadgeData.color).to.equal('lightgray')
  })

  it('sets specified issue URL and sets red color', async function () {
    const service = retiredService({
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
