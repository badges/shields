'use strict'

const { expect } = require('chai')
const deprecatedService = require('./deprecated-service')

describe('DeprecatedService', function() {
  const route = {
    base: 'coverity/ondemand',
    format: '(?:.+)',
  }

  it('returns true on isDeprecated', function() {
    const service = deprecatedService({ route })
    expect(service.isDeprecated).to.be.true
  })

  it('sets specified route', function() {
    const service = deprecatedService({ route })
    expect(service.route).to.deep.equal(route)
  })

  it('sets specified label', function() {
    const label = 'coverity'
    const service = deprecatedService({ route, label })
    expect(service.defaultBadgeData.label).to.equal(label)
  })

  it('sets specified category', function() {
    const category = 'analysis'
    const service = deprecatedService({ route, category })
    expect(service.category).to.equal(category)
  })

  it('sets specified examples', function() {
    const examples = [
      {
        title: 'Not sure we would have examples',
      },
    ]
    const service = deprecatedService({ route, examples })
    expect(service.examples).to.deep.equal(examples)
  })

  it('uses default deprecation message when no message specified', async function() {
    const service = deprecatedService({ route })
    expect(await service.invoke()).to.deep.equal({
      isError: true,
      color: 'lightgray',
      message: 'no longer available',
    })
  })

  it('uses custom deprecation message when specified', async function() {
    const message = 'extended outage'
    const service = deprecatedService({ route, message })
    expect(await service.invoke()).to.deep.equal({
      isError: true,
      color: 'lightgray',
      message,
    })
  })
})
