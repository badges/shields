import Joi from 'joi';
import {optionalUrl} from '../validators.js';
import {renderVersionBadge} from '../version.js';
import {BaseXmlService} from '../index.js';

const queryParamSchema = Joi.object({
  metadataUrl: optionalUrl.required(),
}).required()

const schema = Joi.object({
  metadata: Joi.object({
    versioning: Joi.object({
      versions: Joi.object({
        version: Joi.array().items(Joi.string().required()).single().required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

export default class MavenMetadata extends BaseXmlService {
  static category = 'version'

  static route = {
    base: 'maven-metadata',
    pattern: 'v',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Maven metadata URL',
      namedParams: {},
      queryParams: {
        metadataUrl:
          'https://repo1.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml',
      },
      staticPreview: renderVersionBadge({ version: '2.8.5' }),
    },
  ]

  static defaultBadgeData = {
    label: 'maven',
  }

  async fetch({ metadataUrl }) {
    return this._requestXml({
      schema,
      url: metadataUrl,
      parserOptions: { parseNodeValue: false },
    })
  }

  async handle(_namedParams, { metadataUrl }) {
    const data = await this.fetch({ metadataUrl })
    return renderVersionBadge({
      version: data.metadata.versioning.versions.version.slice(-1)[0],
    })
  }
};
