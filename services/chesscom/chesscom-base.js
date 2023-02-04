import { BaseJsonService } from '../index.js'

class BaseChessComStatsService extends BaseJsonService {
  static category = 'rating'

  static defaultBadgeData = { label: 'rating' }

  // Doc this API. From https://www.chess.com/news/view/published-data-api
  // example: https://api.chess.com/pub/player/hikaru/stats

  async fetch({ username, schema }) {
    return this._requestJson({
      schema,
      url: `https://api.chess.com/pub/player/${username}/stats`,
      errorMessages: {
        404: 'data not found',
      },
    })
  }
}

class BaseChessComPlayerService extends BaseJsonService {
  static category = 'social'

  static defaultBadgeData = { label: 'followers' }

  async fetch({ username, schema }) {
    return this._requestJson({
      schema,
      url: `https://api.chess.com/pub/player/${username}`,
      errorMessages: {
        404: 'player not found',
      },
    })
  }
}

export { BaseChessComStatsService, BaseChessComPlayerService }
