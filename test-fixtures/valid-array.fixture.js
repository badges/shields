'use strict'

const BaseJsonService = require('../services/base-json')
const LegacyService = require('../services/legacy-service')

class GoodServiceOne extends BaseJsonService {}
class GoodServiceTwo extends LegacyService {}

module.exports = [GoodServiceOne, GoodServiceTwo]
