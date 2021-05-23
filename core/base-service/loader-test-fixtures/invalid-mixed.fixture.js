import BaseJsonService from '../base-json.js';

class BadBaseService {}
class GoodService extends BaseJsonService {}
class BadService extends BadBaseService {}

export default [GoodService, BadService];
