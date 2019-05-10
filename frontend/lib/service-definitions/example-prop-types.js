import PropTypes from 'prop-types'

const objectOfKeyValuesPropType = PropTypes.objectOf(PropTypes.string)
  .isRequired

const examplePropType = PropTypes.exact({
  title: PropTypes.string.isRequired,
  link: PropTypes.string,
  example: PropTypes.exact({
    pattern: PropTypes.string.isRequired,
    namedParams: objectOfKeyValuesPropType,
    queryParams: objectOfKeyValuesPropType,
  }).isRequired,
  preview: PropTypes.exact({
    label: PropTypes.string,
    message: PropTypes.string,
    color: PropTypes.string,
    namedLogo: PropTypes.string,
    style: PropTypes.string,
  }),
  isBadgeSuggestion: PropTypes.bool,
  documentation: PropTypes.exact({
    __html: PropTypes.string.isRequired,
  }),
})

export { examplePropType }
