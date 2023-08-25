import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isCommaSeparatedPythonVersions = Joi.string().regex(
  /^\s*(?:(?:===|!=|<=|>=|<|>)\s*)?((?:(?:\d+!)?(?:\d+(?:\.\d+)*))(?:(?:[abc]|rc)\d+)?(?:\.post\d+)?(?:\.dev\d+)?)(?:\s*,\s*(?:(?:===|!=|<=|>=|<|>)\s*)?((?:(?:\d+!)?(?:\d+(?:\.\d+)*))(?:(?:[abc]|rc)\d+)?(?:\.post\d+)?(?:\.dev\d+)?))*\s*$/,
)

t.create('python versions (valid)')
  .get(
    '/python/required-version-toml.json?tomlFilePath=https://raw.githubusercontent.com/numpy/numpy/main/pyproject.toml',
  )
  .expectBadge({ label: 'python', message: isCommaSeparatedPythonVersions })

t.create(
  'python versions - valid toml with missing python-requires field (invalid)',
)
  .get(
    '/python/required-version-toml.json?tomlFilePath=https://raw.githubusercontent.com/django/django/main/pyproject.toml',
  )
  .expectBadge({ label: 'python', message: 'invalid response data' })
