import { test, given } from 'sazerac'
import pathToRegexp from 'path-to-regexp'
import { constructPath } from './path-builder'

describe('<PathBuilder />', function() {
  const tokens = pathToRegexp.parse('github/license/:user/:repo')
  test(constructPath, () => {
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
