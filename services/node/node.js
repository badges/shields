'use strict';

const Joi = require('joi');
const NPMBase = require('../npm/npm-base');
const { versionColorForRange } = require('./node-version-color');

const responseSchema = Joi.object({
  engines: Joi.object().pattern(/./, Joi.string()),
}).required();

module.exports = class NodeVersion extends NPMBase {
  static get category() {
    return 'version';
  }

  static get defaultBadgeData() {
    return { label: 'node' };
  }

  static get url() {
    return this.buildUrl('node/v', { withTag: true });
  }

  static get examples() {
    return [
      {
        previewUrl: 'passport',
        keywords: ['npm'],
      },
      {
        title: 'node (scoped)',
        previewUrl: '@stdlib/stdlib',
        keywords: ['npm'],
      },
      {
        title: 'node (tag)',
        previewUrl: 'passport/latest',
        keywords: ['npm'],
      },
      {
        title: 'node (scoped with tag)',
        previewUrl: '@stdlib/stdlib/latest',
        keywords: ['npm'],
      },
      {
        title: 'node (scoped with tag, custom registry)',
        previewUrl: '@stdlib/stdlib/latest',
        query: { registry_uri: 'https://registry.npmjs.com' },
        keywords: ['npm'],
      },
    ];
  }

  static get responseSchema() {
    return responseSchema;
  }

  static async render(packageData, { tag }) {
    const { engines = {} } = packageData;
    const { node: nodeVersionRange } = engines;

    const label = tag ? `node@${tag}` : undefined;

    if (nodeVersionRange === undefined) {
      return {
        label,
        message: 'not specified',
        color: 'lightgray',
      }
    } else {
      return {
        label,
        message: nodeVersionRange,
        color: await versionColorForRange(nodeVersionRange),
      }
    }
  }
}
