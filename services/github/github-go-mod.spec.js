import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidResponse } from '../index.js'
import GithubGoModGoVersion from './github-go-mod.service.js'

describe('GithubGoModGoVersion', function () {
  describe('valid cases', function () {
    test(GithubGoModGoVersion.transform, () => {
      given('go 1.18').expect({ go: '1.18' })
      given('go 1.18 // inline comment').expect({ go: '1.18' })
      given('go 1.18// inline comment').expect({ go: '1.18' })
      given('go 1.18 /* block comment */').expect({ go: '1.18' })
      given('go 1.18/* block comment */').expect({ go: '1.18' })
      given('go 1').expect({ go: '1' })
      given('go 1.2.3').expect({ go: '1.2.3' })
      given('go string').expect({ go: 'string' })
    })
  })

  describe('invalid cases', function () {
    expect(() => GithubGoModGoVersion.transform('')).to.throw(InvalidResponse)
    expect(() =>
      GithubGoModGoVersion.transform("doesn't start with go"),
    ).to.throw(InvalidResponse)
  })
})
