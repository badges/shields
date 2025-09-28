import { BaseJsonService, InvalidParameter } from '../index.js'

export const description = `
[PingPong](https://pingpong.one/) is a status page and monitoring service.

To see more details about this badge and obtain your api key, visit
[https://my.pingpong.one/integrations/badge-uptime/](https://my.pingpong.one/integrations/badge-uptime/)
`

export const baseUrl = 'https://api.pingpong.one/widget/shields'

export class BasePingPongService extends BaseJsonService {
  static category = 'monitoring'

  static validateApiKey({ apiKey }) {
    if (!apiKey.startsWith('sp_')) {
      throw new InvalidParameter({
        prettyMessage: 'invalid api key',
      })
    }
  }
}
