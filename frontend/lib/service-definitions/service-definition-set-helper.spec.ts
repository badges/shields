import { test, given, forCases } from 'sazerac'
import { predicateFromQuery } from './service-definition-set-helper'
import { Example } from '.'

describe('Badge example functions', function () {
  function exampleMatchesQuery(
    { examples }: { examples: Example[] },
    query: string
  ): boolean {
    return predicateFromQuery(query)({ examples })
  }

  test(exampleMatchesQuery, () => {
    forCases([given({ examples: [{ title: 'node version' }] }, 'npm')]).expect(
      false
    )

    forCases([
      given(
        { examples: [{ title: 'node version', keywords: ['npm'] }] },
        'node'
      ),
      given(
        { examples: [{ title: 'node version', keywords: ['npm'] }] },
        'npm'
      ),
      // https://github.com/badges/shields/issues/1578
      given({ examples: [{ title: 'c++ is the best language' }] }, 'c++'),
    ]).expect(true)
  })
})
