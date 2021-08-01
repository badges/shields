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

  it('sets specified examples', function () {
    const examples = [
      {
        title: 'Not sure we would have examples',
      },
    ]
    const service = deprecatedService({ ...commonAttrs, examples })
    expect(service.examples).to.deep.equal(examples)
  })

  it('uses default deprecation message when no message specified', async function () {
    const service = deprecatedService({ ...commonAttrs })
    expect(await service.invoke()).to.deep.equal({
      isError: true,
      color: 'lightgray',
      message: 'no longer available',
    })
  })

  it('uses custom deprecation message when specified', async function () {
    const message = 'extended outage'
    const service = deprecatedService({ ...commonAttrs, message })
    expect(await service.invoke()).to.deep.equal({
      isError: true,
      color: 'lightgray',
      message,
    })
  })
})
