'use strict'

const BaseService = require('../../services/base')
const BaseJsonService = require('../../services/base-json')
const NonMemoryCachingBaseService = require('../../services/base-non-memory-caching')
const BaseStaticService = require('../../services/base-static')
const BaseSvgScrapingService = require('../../services/base-svg-scraping')
const BaseXmlService = require('../../services/base-xml')
const BaseYamlService = require('../../services/base-yaml')

const deprecatedService = require('../../services/deprecated-service')

const {
  NotFound,
  InvalidResponse,
  Inaccessible,
  InvalidParameter,
  Deprecated,
} = require('../../services/errors')

module.exports = {
  BaseService,
  BaseJsonService,
  NonMemoryCachingBaseService,
  BaseStaticService,
  BaseSvgScrapingService,
  BaseXmlService,
  BaseYamlService,
  deprecatedService,
  NotFound,
  InvalidResponse,
  Inaccessible,
  InvalidParameter,
  Deprecated,
}
