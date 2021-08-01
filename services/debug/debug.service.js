import { BaseService } from '../index.js'

const serverStartTime = new Date(new Date().toGMTString())
let bitFlip = false

export default class Debug extends BaseService {
  static category = 'debug'
  static route = { base: 'debug', pattern: ':variant(time|starttime|flip)' }

  static defaultBadgeData = { label: 'debug', color: 'blue' }

  async handle({ variant }) {
    switch (variant) {
      case 'time':
        return {
          label: 'time',
          message: new Date().toUTCString(),
        }
      case 'starttime':
        return {
          label: 'start time',
          message: new Date(serverStartTime).toUTCString(),
        }
      // For production cache debugging.
      case 'flip':
        bitFlip = !bitFlip
        if (bitFlip) {
          return {
            label: 'flip',
            message: 'on',
            color: 'brightgreen',
          }
        } else {
          return {
            label: 'flip',
            message: 'off',
            color: 'red',
          }
        }
    }
  }
}
