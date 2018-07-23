'use strict';

const { rangeStart, minor } = require('../../lib/version');
const NpmBase = require('./npm-base');

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

  static render({ supportedLanguages }) {
    if (supportedLanguages.length === 0) {
      return { message: 'none', color: 'lightgray' };
    } else {
      return {
        message: supportedLanguages
          .map(
            ({ language, range }) => `${language} v${minor(rangeStart(range))}`
          )
          .join(' | '),
      };
    }
  }

  async handle({ scope, packageName }, { registry_uri: registryUrl }) {
    const { devDependencies } = await this.fetchPackageData({
      scope,
      packageName,
      registryUrl,
    });

    const supportedLanguages = [
      { language: 'TypeScript', range: devDependencies.typescript },
      { language: 'Flow', range: devDependencies['flow-bin'] },
    ].filter(({ range }) => range !== undefined);

    return this.constructor.render({ supportedLanguages });
  }
};
