import { test, given } from 'sazerac'
import {
  renderVersionBadge,
  odataToObject,
  stripBuildMetadata,
  selectVersion,
} from './nuget-helpers.js'

describe('NuGet helpers', function () {
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

  test(stripBuildMetadata, () => {
    given('1.0.0').expect('1.0.0')
    given('1.0.0+1').expect('1.0.0')
  })

  test(selectVersion, () => {
    given(['1.0.0', '1.0.1'], false).expect('1.0.1')
    given(['1.0.0', '1.0.1'], true).expect('1.0.1')
    given(['1.0.0', '1.0.1-pre'], false).expect('1.0.0')
    given(['1.0.0', '1.0.1-pre'], true).expect('1.0.1-pre')
    given(['1.0.0', '1.0.1.0.1.0-pre'], false).expect('1.0.0')
    given(['1.0.0', '1.0.1.0.1.0-pre'], true).expect('1.0.1.0.1.0-pre')
  })
})
