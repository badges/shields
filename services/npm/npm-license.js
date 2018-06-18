'use strict';

const Joi = require('joi');
const { licenseToColor } = require('../../lib/licenses');
const NpmBase = require('./npm-base');

const deprecatedLicenseObjectSchema = Joi.object({
  type: Joi.string().required()
});
const responseSchema = Joi.object({
  license: Joi.alternatives().try(
    Joi.string(),
    deprecatedLicenseObjectSchema,
    Joi.array().items(Joi.alternatives(Joi.string(), deprecatedLicenseObjectSchema))),
}).required();

module.exports = class NpmLicense extends NpmBase {
  static get category() {
    return 'license';
  }

  static get url() {
    return this.buildUrl('npm/l', { withTag: false });
  }

  static get examples() {
    return [
      {
        previewUrl: 'express',
        keywords: ['node'],
      },
      {
        previewUrl: 'express',
        query: { registry_uri: 'https://registry.npmjs.com' },
        keywords: ['node'],
      },
    ];
  }

  static get responseSchema() {
    return responseSchema;
  }

  static render(packageData) {
    let { license } = packageData;

    if (license === undefined) {
      return { message: 'missing', color: 'red' };
    }

    if (Array.isArray(license)) {
      license = license.join(', ');
    } else if (typeof license === 'object') {
      license = license.type;
    }

    return {
      message: license,
      color: licenseToColor(license),
    };
  }
}
