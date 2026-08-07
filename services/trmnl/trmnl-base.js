import { BaseJsonService } from '../index.js'

export default class TrmnlBase extends BaseJsonService {
  async fetch({ recipeId, schema }) {
    // This public proxy is maintained at:
    // https://github.com/hossain-khan/trmnl-badges
    // It provides caching and request deduplication in front of trmnl.com.
    return this._requestJson({
      schema,
      url: 'https://trmnl-badges.gohk.xyz/api/stats',
      options: { searchParams: { recipe: recipeId } },
      httpErrors: {
        404: 'recipe not found',
      },
    })
  }
}
