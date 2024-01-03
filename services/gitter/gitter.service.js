import { BaseStaticService, pathParams } from '../index.js'

export default class Gitter extends BaseStaticService {
  static category = 'chat'

  static route = {
    base: 'gitter/room',
    pattern: ':user/:repo',
  }

  static openApi = {
    '/gitter/room/{user}/{repo}': {
      get: {
        summary: 'Gitter',
        parameters: pathParams(
          {
            name: 'user',
            example: 'nwjs',
          },
          {
            name: 'repo',
            example: 'nw.js',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'chat' }

  static render() {
    return { message: 'on gitter', color: 'brightgreen' }
  }

  handle() {
    return this.constructor.render()
  }
}
