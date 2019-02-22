'use strict'

const { test, given } = require('sazerac')
const { renderVersionBadge, odataToObject } = require('./nuget-helpers')

describe('NuGet helpers', function() {
  test(renderVersionBadge, () => {
    given({ version: '1.2-beta' }).expect({
      label: undefined,
      message: 'v1.2-beta',
      color: 'yellow',
    })
    given({ version: '0.35' }).expect({
      label: undefined,
      message: 'v0.35',
      color: 'orange',
    })
    given({ version: '1.2.7' }).expect({
      label: undefined,
      message: 'v1.2.7',
      color: 'blue',
    })
  })

  test(odataToObject, () => {
    given({ 'm:properties': { 'd:Version': '1.2.3' } }).expect({
      Version: '1.2.3',
    })
    given(undefined).expect(undefined)
  })
})
