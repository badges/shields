import Joi from 'joi'
import { NotFound } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseChessComStatsService } from './chesscom-base.js'

const rapidSchema = Joi.object({
  chess_rapid: Joi.object({
    last: Joi.object({
      rating: nonNegativeInteger,
    }),
  }).required(),
}).required()

const bulletSchema = Joi.object({
  chess_bullet: Joi.object({
    last: Joi.object({
      rating: nonNegativeInteger,
    }),
  }).required(),
}).required()

const blitzSchema = Joi.object({
  chess_blitz: Joi.object({
    last: Joi.object({
      rating: nonNegativeInteger,
    }),
  }).required(),
}).required()

export default class ChessComRating extends BaseChessComStatsService {
  static route = { base: 'chesscom/rating', pattern: ':gametype/:username' }

  static examples = [
    {
      title: 'Chess.com rating',
      namedParams: {
        gametype: 'rapid',
        username: 'hikaru',
      },
      staticPreview: this.render({ stats: { last: { rating: 400 } } }),
      keywords: ['game', 'board game'],
    },
  ]

  static render({ stats }) {
    return {
      label: 'rating',
      message: `${stats.last.rating}`,
      color: 'blue',
    }
  }

  async handle({ gametype, username }) {
    if (gametype === 'rapid') {
      const { chess_rapid: stats } = await this.fetch({
        username,
        schema: rapidSchema,
      })
      return this.constructor.render({ stats })
    } else if (gametype === 'bullet') {
      const { chess_bullet: stats } = await this.fetch({
        username,
        schema: bulletSchema,
      })
      return this.constructor.render({ stats })
    } else if (gametype === 'blitz') {
      const { chess_blitz: stats } = await this.fetch({
        username,
        schema: blitzSchema,
      })
      return this.constructor.render({ stats })
    } else {
      throw new NotFound({
        prettyMessage: 'invalid game type, try rapid or bullet or blitz',
      })
    }
  }
}
