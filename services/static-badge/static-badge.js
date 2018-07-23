'use strict';

const { BaseService } = require('../base');

module.exports = class StaticBadge extends BaseService {
  async handle({label, message, color}) {
    return {
      label,
      message,
      color
    };
  }

  static get category() {
    return 'miscellaneous';
  }

  static get url() {
    return {
    format: '(?:badge|:)/?((?:[^-]|--)*?)-((?:[^-]|--)*)-((?:[^-]|--)+)',
      capture: ['label', 'message', 'color']
    };
  }
};
