'use strict'

const BaseJsonService = require('../core/base-service/base-json')

class BadBaseService {}
class GoodService extends BaseJsonService {}
class BadService extends BadBaseService {}

module.exports = [GoodService, BadService]
