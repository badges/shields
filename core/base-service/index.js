'use strict'

const BaseService = require('./base')
const BaseJsonService = require('./base-json')
const BaseGraphqlService = require('./base-graphql')
const NonMemoryCachingBaseService = require('./base-non-memory-caching')
const BaseStaticService = require('./base-static')
const BaseSvgScrapingService = require('./base-svg-scraping')
const BaseXmlService = require('./base-xml')
const BaseYamlService = require('./base-yaml')
const deprecatedService = require('./deprecated-service')
const redirector = require('./redirector')
const {
  NotFound,
  InvalidResponse,
  Inaccessible,
  InvalidParameter,
  Deprecated,
} = require('./errors')

module.exports = {
  BaseService,
  BaseJsonService,
  BaseGraphqlService,
  NonMemoryCachingBaseService,
  BaseStaticService,
  BaseSvgScrapingService,
  BaseXmlService,
  BaseYamlService,
  deprecatedService,
  redirector,
  NotFound,
  InvalidResponse,
  Inaccessible,
  InvalidParameter,
  Deprecated,
}
