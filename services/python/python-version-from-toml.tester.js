import Joi from 'joi'
import semver from 'semver'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const validatePep440 = (value, helpers) => {
  if (!semver.validRange(value)) {
    return helpers.error('any.invalid')
  }
  return value
}

const isCommaSeparatedPythonVersions = Joi.string().custom(validatePep440)

t.create('python versions (valid)')
  .get(
    '/python/required-version-toml.json?tomlFilePath=https://raw.githubusercontent.com/numpy/numpy/main/pyproject.toml',
  )
  .expectBadge({ label: 'python', message: isCommaSeparatedPythonVersions })

t.create(
  'python versions - valid toml with missing python-requires field (invalid)',
)
  .get(
    '/python/required-version-toml.json?tomlFilePath=https://raw.githubusercontent.com/psf/requests/main/pyproject.toml',
  )
  .expectBadge({ label: 'python', message: 'invalid response data' })
