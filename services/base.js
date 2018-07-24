'use strict';

const {
  NotFound,
  InvalidResponse,
  Inaccessible,
} = require('./errors');
const {
  makeLogo,
  toArray,
  makeColor,
  setBadgeColor,
} = require('../lib/badge-data');
const {
  checkErrorResponse,
  asJson,
} = require('../lib/error-helper');


class BaseService {
  constructor({ sendAndCacheRequest }, { handleInternalErrors }) {
    this._sendAndCacheRequest = sendAndCacheRequest;
    this._handleInternalErrors = handleInternalErrors;
  }

  /**
   * Asynchronous function to handle requests for this service. Takes the URL
   * parameters (as defined in the `url` property), performs a request using
   * `this._sendAndCacheRequest`, and returns the badge data.
   */
  async handle(namedParams, queryParams) {
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
   *  - queryParams: Array of names for query parameters which will the service
   *                 uses. For cache safety, only the whitelisted query
   *                 parameters will be passed to the handler.
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

  static _makeFullUrl(partialUrl) {
    return '/' + [this.url.base, partialUrl].filter(Boolean).join('/');
  }

  /**
   * Return an array of examples. Each example is prepared according to the
   * schema in `lib/all-badge-examples.js`. Four keys are supported:
   *  - title
   *  - previewUrl
   *  - exampleUrl
   *  - documentation
   */
  static prepareExamples() {
    return this.examples.map(({ title, previewUrl, exampleUrl, documentation }) => {
      if (! previewUrl) {
        throw Error(`Example for ${this.name} is missing required previewUrl`);
      }

      return {
        title: title ? `${title}` : this.name,
        previewUri: `${this._makeFullUrl(previewUrl)}.svg`,
        exampleUri: exampleUrl ? `${this._makeFullUrl(exampleUrl)}.svg` : undefined,
        documentation,
      };
    });
  }

  static get _regex() {
    // Regular expressions treat "/" specially, so we need to escape them
    const escapedPath = this.url.format.replace(/\//g, '\\/');
    const fullRegex = `^${this._makeFullUrl(escapedPath)}.(svg|png|gif|jpg|json)$`;
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

  async invokeHandler(namedParams, queryParams) {
    try {
      return await this.handle(namedParams, queryParams);
    } catch (error) {
      if (error instanceof NotFound) {
        return {
          message: error.prettyMessage,
          color: 'red',
        };
      } else if (error instanceof InvalidResponse ||
        error instanceof Inaccessible) {
        return {
          message: error.prettyMessage,
          color: 'lightgray',
        };
      } else if (this._handleInternalErrors) {
        console.log(error);
        return {
          label: 'shields',
          message: 'internal error',
          color: 'lightgray',
        };
      } else {
        throw error;
      }
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

    const {
      color: defaultColor,
      logo: defaultLogo,
      label: defaultLabel,
    } = this.defaultBadgeData;

    const badgeData = {
      text: [
        overrideLabel || serviceLabel || defaultLabel || this.category,
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

  static register(camp, handleRequest, { handleInternalErrors }) {
    const ServiceClass = this; // In a static context, "this" is the class.

    camp.route(this._regex, handleRequest({
      queryParams: this.url.queryParams,
      handler: async (queryParams, match, sendBadge, request) => {
        const namedParams = this._namedParamsForMatch(match);
        const serviceInstance = new ServiceClass({
          sendAndCacheRequest: request.asPromise,
        }, { handleInternalErrors });
        const serviceData = await serviceInstance.invokeHandler(namedParams, queryParams);
        const badgeData = this._makeBadgeData(queryParams, serviceData);

        // Assumes the final capture group is the extension
        const format = match.slice(-1)[0];
        sendBadge(format, badgeData);
      },
    }));
  }
};

class BaseJsonService extends BaseService {
  async _requestJson(url, options = {}, notFoundMessage) {
    return this._sendAndCacheRequest(url,
      {...{ 'headers': { 'Accept': 'application/json' } }, ...options}
    ).then(
      checkErrorResponse.asPromise(
        notFoundMessage ? { notFoundMessage: notFoundMessage } : undefined
      )
    ).then(asJson);
  }
};

module.exports = {
  BaseService,
  BaseJsonService,
};
