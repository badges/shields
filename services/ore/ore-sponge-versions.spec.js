import { test, forCases, given } from 'sazerac'
import OreSpongeVersions from './ore-sponge-versions.service.js'

const PROMOTED_VERSIONS = [
  {
    version: 'dummy',
    tags: [{ name: 'sponge', display_data: null }],
  },
  {
    version: 'dummy',
    tags: [{ name: 'sponge', display_data: '1.23' }],
  },
  {
    version: 'dummy',
    tags: [{ name: 'sponge', display_data: '4.56' }],
  },
]

describe('OreSpongeVersions', function () {
  test(OreSpongeVersions.prototype.transform, () => {
    forCases(
      [given({ data: { promoted_versions: PROMOTED_VERSIONS } })],
      [
        given({
          data: {
            promoted_versions: [
              {
                version: 'dummy',
                tags: [{ name: 'dummy', display_data: 'dummy' }],
              },
              ...PROMOTED_VERSIONS,
            ],
          },
        }),
      ]
    ).expect({ versions: ['1.23', '4.56'] })
  })

  test(OreSpongeVersions.render, () => {
    given({
      versions: [],
    }).expect({ message: 'none', color: 'inactive' })
  })

  test(OreSpongeVersions.render, () => {
    given({ versions: ['1.23', '4.56'] }).expect({
      message: '1.23 | 4.56',
      color: 'blue',
    })
  })

  test(OreSpongeVersions.render, () => {
    given({ versions: ['1.23'] }).expect({
      message: '1.23',
      color: 'blue',
    })
  })
})
