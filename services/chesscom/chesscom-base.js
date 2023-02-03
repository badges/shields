import { BaseJsonService } from '../index.js'

class BaseStatsChessDotComService extends BaseJsonService {
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

class BasePlayerChessDotComService extends BaseJsonService {
  static category = 'social'

  static defaultBadgeData = { label: 'followers' }

  // Doc this API. From https://www.chess.com/news/view/published-data-api
  // example: https://api.chess.com/pub/player/hikaru/stats

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

export { BaseStatsChessDotComService, BasePlayerChessDotComService }
