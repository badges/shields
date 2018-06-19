'use strict';

const Joi = require('joi');
const { addv } = require('../../lib/text-formatters');
const { version: versionColor } = require('../../lib/color-formatters');
const NpmBase = require('./npm-base');

// Joi.string should be a semver.
const responseSchema = Joi.object().pattern(/./, Joi.string()).required();

module.exports = class NpmVersion extends NpmBase {
  static get category() {
    return 'version';
  }

  static get url() {
    return this.buildUrl('npm/v', { withTag: true });
  }

  static get defaultBadgeData() {
    return { label: 'npm' };
  }

  static get examples() {
    return [
      {
        previewUrl: 'npm',
        keywords: ['node']
      },
      {
        title: 'npm (scoped)',
        previewUrl: '@cycle/core',
        keywords: ['node'],
      },
      {
        title: 'npm (tag)',
        previewUrl: 'npm/next',
        keywords: ['node'],
      },
      {
        title: 'npm (custom registry)',
        previewUrl: 'npm/next',
        query: { registry_uri: 'https://registry.npmjs.com' },
        keywords: ['node'],
      },
      {
        title: 'npm (scoped with tag)',
        previewUrl: '@cycle/core/canary',
        keywords: ['node'],
      },
    ];
  }

  static get responseSchema() {
    return responseSchema;
  }

  static render(packageData, { tag }) {
    let label, version;

    if (tag) {
      if (tag in packageData) {
        label = `npm@${tag}`;
        version = packageData[tag];
      } else {
        return {
          message: 'tag not found',
          color: 'red',
        };
      }
    } else {
      version = packageData.latest;
    }

    return {
      label,
      message: addv(version),
      color: versionColor(version),
    };
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName } = namedParams;
    const { registry_uri: registryUrl = this.constructor.defaultRegistryUrl } = queryParams;

    const slug = scope === undefined
      ? packageName
      : this.constructor.encodeScopedPackage({ scope, packageName });
    const url = `${registryUrl}/-/package/${slug}/dist-tags`;

    let packageData = await this._requestJson(url);
console.log('packageData', packageData)
    packageData = this.constructor.validateResponse(packageData);

    return this.constructor.render(packageData, namedParams, queryParams);
  }
}
