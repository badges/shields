import { BaseJsonService } from '../index.js'

export function getColorOfBadge(number) {
  return number > 0 ? 'brightgreen' : number === 0 ? 'orange' : 'red'
}

export default class HackerNewsBase extends BaseJsonService {
  async fetchHNStory({ schema, id }) {
    return this._requestJson({
      schema,
      url: `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
      errorMessages: {
        404: 'not found',
      },
    })
  }
}
