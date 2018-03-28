'use strict';

const {
  makeLogo,
  toArray,
  makeColor,
  setBadgeColor,
} = require('../lib/badge-data');

module.exports = class BaseService {
  constructor({sendAndCacheRequest}) {
    this._sendAndCacheRequest = sendAndCacheRequest;
  }

  /**
   * Asynchronous function to handle requests for this service. Takes the URL
   * parameters (as defined in the `url` property), performs a request using
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
   * Returns an object:
   *  - base: (Optional) The base path of the URLs for this service. This is
   *    used as a prefix.
   *  - format: Regular expression to use for URLs for this service's badges
   *  - capture: Array of names for the capture groups in the regular
   *             expression. The handler will be passed an object containing
   *             the matches.
   */
  static get url() {
    throw new Error(`URL not defined for ${this.name}`);
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
   * Example URLs for this service. These should use the format
   * specified in `url`, and can be used to demonstrate how to use badges for
   * this service.
   */
  static get examples() {
    return [];
  }

  static get _regex() {
    const { base, format } = this.url;
    // Regular expressions treat "/" specially, so we need to escape them
    const escapedPath = format.replace(/\//g, '\\/');
    const joined = [base, escapedPath].filter(Boolean).join('/');
    const fullRegex = `^/${joined}.(svg|png|gif|jpg|json)$`;
    return new RegExp(fullRegex);
  }

  static _namedParamsForMatch(match) {
    // Assume the last match is the format, and drop match[0], which is the
    // entire match.
    const captures = match.slice(1, -1);

    if (this.url.capture.length !== captures.length) {
      throw new Error(
        `Service ${this.constructor.name} declares incorrect number of capture groups `+
        `(expected ${this.url.capture.length}, got ${captures.length})`
      );
    }

    const result = {};
    this.url.capture.forEach((name, index) => {
      result[name] = captures[index];
    });
    return result;
  }

  async invokeHandler(namedParams) {
    try {
      return await this.handle(namedParams);
    } catch (error) {
      console.log(error);
      return { message: 'error' };
    }
  }

  static _makeBadgeData(overrides, serviceData) {
    const {
      style,
      label: overrideLabel,
      logo: overrideLogo,
      logoWidth: overrideLogoWidth,
      link: overrideLink,
      colorA: overrideColorA,
      colorB: overrideColorB,
    } = overrides;

    const {
      label: serviceLabel,
      message: serviceMessage,
      color: serviceColor,
      link: serviceLink,
    } = serviceData;

    const defaultLabel = this.category;
    const {
      color: defaultColor,
      logo: defaultLogo,
    } = this.defaultBadgeData;

    const badgeData = {
      text: [
        overrideLabel || serviceLabel || defaultLabel,
        serviceMessage || 'n/a',
      ],
      template: style,
      logo: makeLogo(style === 'social' ? defaultLogo : undefined, { logo: overrideLogo }),
      logoWidth: +overrideLogoWidth,
      links: toArray(overrideLink || serviceLink),
      colorA: makeColor(overrideColorA),
    };
    const color = overrideColorB || serviceColor || defaultColor || 'lightgrey';
    setBadgeColor(badgeData, color);

    return badgeData;
  }

  static register(camp, handleRequest) {
    const ServiceClass = this; // In a static context, "this" is the class.

    camp.route(this._regex,
    handleRequest(async (queryParams, match, sendBadge, request) => {
      const namedParams = this._namedParamsForMatch(match);
      const serviceInstance = new ServiceClass({
        sendAndCacheRequest: request.asPromise,
      });
      const serviceData = await serviceInstance.invokeHandler(namedParams);
      const badgeData = this._makeBadgeData(queryParams, serviceData);

      // Assumes the final capture group is the extension
      const format = match.slice(-1)[0];
      sendBadge(format, badgeData);
    }));
  }
};
