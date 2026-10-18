import { expect } from 'chai'
import nock from 'nock'
import {
  prepareRoute,
  namedParamsForMatch,
} from '../../core/base-service/route.js'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import LibrariesIoDependents from './librariesio-dependents.service.js'
import LibrariesIoDependentRepos from './librariesio-dependent-repos.service.js'
import LibrariesIoSourcerank from './librariesio-sourcerank.service.js'
import LibrariesIoApiProvider from './librariesio-api-provider.js'

function matchRoute(ServiceClass, path) {
  const { regex, captureNames } = prepareRoute(ServiceClass.route)
  const match = regex.exec(`/${ServiceClass.route.base}/${path}`)
  if (!match) {
    return null
  }
  return namedParamsForMatch(captureNames, match, ServiceClass)
}

describe('Libraries.io project routes', function () {
  for (const ServiceClass of [
    LibrariesIoDependents,
    LibrariesIoDependentRepos,
    LibrariesIoSourcerank,
  ]) {
    describe(ServiceClass.name, function () {
      it('matches an unscoped package', function () {
        expect(matchRoute(ServiceClass, 'npm/got.svg')).to.deep.equal({
          platform: 'npm',
          scope: undefined,
          packageName: 'got',
        })
      })

      it('matches a scoped npm package', function () {
        expect(matchRoute(ServiceClass, 'npm/@babel/core.svg')).to.deep.equal({
          platform: 'npm',
          scope: '@babel',
          packageName: 'core',
        })
      })

      it('matches a package name containing slashes', function () {
        expect(
          matchRoute(ServiceClass, 'go/github.com/ipfs/kubo.svg'),
        ).to.deep.equal({
          platform: 'go',
          scope: undefined,
          packageName: 'github.com/ipfs/kubo',
        })
      })
    })
  }
})

describe('LibrariesIoDependents', function () {
  cleanUpNockAfterEach()

  it('requests a package name containing slashes', async function () {
    const librariesIoApiProvider = new LibrariesIoApiProvider({
      baseUrl: 'https://libraries.io/api',
    })
    const scope = nock('https://libraries.io/api')
      .get('/go/github.com%2Fipfs%2Fkubo')
      .reply(200, {
        platform: 'Go',
        dependents_count: 199,
        dependent_repos_count: 143,
        rank: 20,
      })

    expect(
      await LibrariesIoDependents.invoke(
        { ...defaultContext, librariesIoApiProvider },
        {},
        { platform: 'go', packageName: 'github.com/ipfs/kubo' },
      ),
    ).to.deep.equal({
      message: '199',
      color: 'brightgreen',
    })

    scope.done()
  })
})
