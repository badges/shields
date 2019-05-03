'use strict'

const BaseJsonService = require('../base-json')

class BadBaseService {}
class GoodService extends BaseJsonService {}
class BadService extends BadBaseService {}

module.exports = [GoodService, BadService]
