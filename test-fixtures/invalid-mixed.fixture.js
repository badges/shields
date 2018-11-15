'use strict'

const BaseJsonService = require('../services/base-json')

class BadBaseService {}
class GoodService extends BaseJsonService {}
class BadService extends BadBaseService {}

module.exports = [GoodService, BadService]
