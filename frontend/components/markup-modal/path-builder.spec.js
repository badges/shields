import PathBuilder from './path-builder'
import { test, given } from 'sazerac'
import pathToRegexp from 'path-to-regexp'

describe('<PathBuilder />', function() {
  const tokens = pathToRegexp.parse('github/license/:user/:repo')
  test(PathBuilder.constructPath, () => {
    given({
      tokens,
      namedParams: {
        user: 'paulmelnikow',
        repo: 'react-boxplot',
      },
    }).expect({
      path: 'github/license/paulmelnikow/react-boxplot',
      isComplete: true,
    })
    given({
      tokens,
      namedParams: {
        user: 'paulmelnikow',
      },
    }).expect({
      path: 'github/license/paulmelnikow/:repo',
      isComplete: false,
    })
  })
})
