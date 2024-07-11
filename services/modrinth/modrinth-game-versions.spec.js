import { test, given } from 'sazerac'
import ModrinthGameVersions from './modrinth-game-versions.service.js'

describe('render function', function () {
  it('displays up to five versions', async function () {
    test(ModrinthGameVersions.render, () => {
      given({ versions: ['1.1', '1.2', '1.3', '1.4', '1.5'] }).expect({
        message: '1.1 | 1.2 | 1.3 | 1.4 | 1.5',
        color: 'blue',
      })
    })
  })

  it('uses ellipsis for six versions or more', async function () {
    test(ModrinthGameVersions.render, () => {
      given({ versions: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'] }).expect({
        message: '1.1 | 1.2 | ... | 1.5 | 1.6',
        color: 'blue',
      })
    })
  })
})
