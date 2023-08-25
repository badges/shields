import Joi from 'joi'
import BaseTomlService from '../../core/base-service/base-toml.js'
import { optionalUrl } from '../validators.js'

const queryParamSchema = Joi.object({
  tomlFilePath: optionalUrl.required(),
}).required()

const schema = Joi.object({
  project: Joi.object({
    'requires-python': Joi.string().required(),
  }).required(),
}).required()

const documentation = `Shows the required python version for a package based on the values in the requires-python field in the pyproject.toml \n
a URL of the toml is required, please note that when linking to files in github or similar sites, provide URL to raw file, for example:

Use https://raw.githubusercontent.com/numpy/numpy/main/pyproject.toml \n
And not https://github.com/numpy/numpy/blob/main/pyproject.toml
`

class PythonVersionFromToml extends BaseTomlService {
  static category = 'platform-support'

  static route = {
    base: '',
    pattern: 'python/required-version-toml',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Python Required Version TOML',
      namedParams: {},
      queryParams: {
        tomlFilePath:
          'https://raw.githubusercontent.com/numpy/numpy/main/pyproject.toml',
      },
      staticPreview: this.render({ requiresPythonString: '>=3.9' }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'python' }

  static render({ requiresPythonString }) {
    // we only show requries-python as is
    // for more info read the following issues:
    // https://github.com/badges/shields/issues/9410
    // https://github.com/badges/shields/issues/5551
    return {
      message: requiresPythonString,
      color: 'blue',
    }
  }

  async handle(namedParams, { tomlFilePath }) {
    const tomlData = await this._requestToml({ url: tomlFilePath, schema })
    const requiresPythonString = tomlData.project['requires-python']

    return this.constructor.render({ requiresPythonString })
  }
}

export { PythonVersionFromToml }
