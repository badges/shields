import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isCommaSeparatedPythonVersions = Joi.string().regex(
  // This should test for PEP440
  // Accepted values are one or more Version specifiers as defined at https://peps.python.org/pep-0440/#version-specifiers
  // Some strings might include spaces, those are valid, values are comma seperated
  // Versions should fit the version scheme https://peps.python.org/pep-0440/#version-scheme
  // This is based on the example in PEP440 at https://peps.python.org/pep-0440/#appendix-b-parsing-version-strings-with-regular-expressions
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
