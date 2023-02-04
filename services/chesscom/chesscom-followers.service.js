import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseChessComPlayerService } from './chesscom-base.js'

const schema = Joi.object({
  followers: nonNegativeInteger,
}).required()

export default class ChessComFollowers extends BaseChessComPlayerService {
  static route = { base: 'chesscom/followers', pattern: ':username' }
  static examples = [
    {
      title: 'Chess.com followers',
      namedParams: { username: 'alexandresanlim' },
      staticPreview: Object.assign(this.render({ followers: 150 }), {
        label: 'Follow',
        style: 'social',
      }),
      queryParams: { label: 'Follow' },
      keywords: ['game', 'board game'],
    },
  ]

  static render({ followers }) {
    return {
      message: metric(followers),
      color: 'blue',
    }
  }

  async handle({ username }) {
    const { followers } = await this.fetch({
      username,
      schema,
    })
    return this.constructor.render({ followers })
  }
}
