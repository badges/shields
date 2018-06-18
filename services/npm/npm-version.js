'use strict';

const Joi = require('joi');
const { addv } = require('../../lib/text-formatters');
const { version: versionColor } = require('../../lib/color-formatters');
const NpmBase = require('./npm-base');

const responseSchema = Joi.object({
  latest: Joi.string().required(), // This should be a semver.
}).required();

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
    const { latest } = packageData;
    return {
      label: tag ? `npm@${tag}` : undefined,
      message: addv(latest),
      color: versionColor(latest),
    };
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, tag } = namedParams;
    const { registry_uri: registryUrl = this.constructor.defaultRegistryUrl } = queryParams;

    const slug = scope === undefined
      ? packageName
      : this.constructor.encodeScopedPackage({ scope, packageName });
    const url = `${registryUrl}/-/package/${slug}/dist-tags`;

    let packageData = await this._requestJson(url);
    packageData = this.constructor.validateResponse(packageData);

    return this.constructor.render(packageData, namedParams, queryParams);
  }
}
