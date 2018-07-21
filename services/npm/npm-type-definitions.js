'use strict';

const Joi = require('joi');
const NpmBase = require('./npm-base');

const responseSchema = Joi.object({
  devDependencies: Joi.object().pattern(/./, Joi.string()),
}).required();

module.exports = class NpmTypeDefinitions extends NpmBase {
  static get category() {
    return 'version';
  }

  static get defaultBadgeData() {
    return { label: 'type definitions' };
  }

  static get url() {
    return this.buildUrl('npm/types', { withTag: false });
  }

  static get examples() {
    return [
      {
        title: 'npm type definitions',
        previewUrl: 'chalk',
        keywords: ['node', 'typescript', 'flow'],
      },
    ];
  }

  static get responseSchema() {
    return responseSchema;
  }

  static render({ devDependencies }) {
    const supportedLanguages = [
      { name: 'TypeScript', range: devDependencies.typescript },
      { name: 'Flow', range: devDependencies['flow-bin'] },
    ]
      .filter(lang => lang.range !== undefined)
      .map(({ name, range }) => {
        const version = minor(rangeStart(range));
        return `${name} v${version}`;
      });

    if (supportedLanguages.length > 0) {
      return {
        message: supportedLanguages.join(' | '),
        color: 'blue',
      };
    } else {
      return {
        message: 'none',
        color: 'lightgray',
      };
    }
  }
};
