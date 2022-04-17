import BaseService from './base.js'
import {
  serverHasBeenUpSinceResourceCached,
  setCacheHeadersForStaticResource,
} from './cache-headers.js'
import { prepareRoute } from './route.js'

export default class BaseStaticService extends BaseService {
  static _applyCacheHeaders({ res }) {
    setCacheHeadersForStaticResource(res)
  }

  static register({ app, ...serviceContext }, serviceConfig) {
    const { regex } = prepareRoute(this.route)
    app.get(
      regex,
      (req, res, next) => {
        if (serverHasBeenUpSinceResourceCached(req)) {
          // Send Not Modified.
          res.status(304)
          res.end()
        } else {
          next()
        }
      },
      this.makeExpressHandler(serviceContext, serviceConfig)
    )
  }
}
