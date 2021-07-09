import { BaseStaticService } from '../index.js'

export default class Gitter extends BaseStaticService {
  static category = 'chat'

  static route = {
    base: 'gitter/room',
    pattern: ':user/:repo',
  }

  static examples = [
    {
      title: 'Gitter',
      namedParams: {
        user: 'nwjs',
        repo: 'nw.js',
      },
      staticPreview: this.render(),
    },
  ]

  static defaultBadgeData = { label: 'chat' }

  static render() {
    return { message: 'on gitter', color: 'brightgreen' }
  }

  handle() {
    return this.constructor.render()
  }
}
