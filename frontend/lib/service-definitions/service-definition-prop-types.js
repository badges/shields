import PropTypes from 'prop-types'

// This should be kept in sync with the schema in
// `core/base-service/service-definitions.js`.

const arrayOfStringsPropType = PropTypes.arrayOf(PropTypes.string.isRequired)
  .isRequired
const objectOfKeyValuesPropType = PropTypes.objectOf(PropTypes.string)
  .isRequired

const examplePropType = PropTypes.exact({
  title: PropTypes.string.isRequired,
  example: PropTypes.exact({
    pattern: PropTypes.string.isRequired,
    namedParams: objectOfKeyValuesPropType,
    queryParams: objectOfKeyValuesPropType,
  }).isRequired,
  preview: PropTypes.exact({
    label: PropTypes.string,
    message: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    style: PropTypes.string,
    namedLogo: PropTypes.string,
  }).isRequired,
  keywords: arrayOfStringsPropType,
  documentation: PropTypes.exact({
    __html: PropTypes.string.isRequired,
  }),
})

const serviceDefinitionPropType = PropTypes.exact({
  category: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isDeprecated: PropTypes.bool.isRequired,
  // Route is missing for e.g. Buildkite.
  route: PropTypes.oneOfType([
    PropTypes.exact({
      pattern: PropTypes.string.isRequired,
      queryParams: arrayOfStringsPropType,
    }),
    PropTypes.exact({
      format: PropTypes.string.isRequired,
      queryParams: arrayOfStringsPropType,
    }),
  ]),
  examples: PropTypes.arrayOf(examplePropType).isRequired,
}).isRequired

export {
  arrayOfStringsPropType,
  objectOfKeyValuesPropType,
  examplePropType,
  serviceDefinitionPropType,
}
