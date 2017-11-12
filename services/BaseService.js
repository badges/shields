'use strict';

module.exports = class BaseService {
  constructor({sendAndCacheRequest}) {
    this._sendAndCacheRequest = sendAndCacheRequest;
  }

  /**
   * Asynchronous function to handle requests for this service. Takes the URI
   * parameters (as defined in the `uri` property), performs a request using
   * `this._sendAndCacheRequest`, and returns the badge data.
   */
  async handle(namedParams) {
    throw new Error(
      `Handler not implemented for ${this.constructor.name}`
    );
  }

  // Metadata

  /**
   * Name of the category to sort this badge into (eg. "build"). Used to sort
   * the badges on the main shields.io website.
   */
  static get category() {
    return 'unknown';
  }
  /**
   * Returns an object with two fields:
   *  - format: Regular expression to use for URIs for this service's badges
   *  - capture: Array of names for the capture groups in the regular
   *             expression. The handler will be passed an object containing
   *             the matches.
   */
  static get uri() {
    throw new Error(`URI not defined for ${this.name}`);
  }

  /**
   * Default data for the badge. Can include things such as default logo, color,
   * etc. These defaults will be used if the value is not explicitly overridden
   * by either the handler or by the user via URL parameters.
   */
  static get defaultBadgeData() {
    return {};
  }

  /**
   * Example URIs for this service. These should use the format
   * specified in `uri`, and can be used to demonstrate how to use badges for
   * this service.
   */
  static getExamples() {
    return [];
  }
}
