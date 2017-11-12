import url from 'url';
import React from 'react';
import PropTypes from 'prop-types';

function resolveUri (uri, baseUri, options) {
  const { longCache } = options || {};
  const resolved = baseUri ? url.resolve(baseUri, uri) : uri;
  if (longCache) {
    const parsed = url.parse(resolved, true);
    parsed.query.maxAge = '2592000';
    // url.format will re-format `query`, but only When `search` is deleted.
    delete parsed.search;
    return url.format(parsed);
  } else {
    return resolved;
  }
}

const Badge = ({ title, previewUri, exampleUri, documentation, baseUri, isProductionBuild, onClick }) => {
  const handleClick = () => onClick({ title, previewUri, exampleUri, documentation });

  const previewImage = previewUri
    ? (<img onClick={handleClick} src={resolveUri(previewUri, baseUri, { longCache: isProductionBuild } )} alt="" />)
    : '\u00a0'; // non-breaking space
  const resolvedExampleUri = resolveUri(exampleUri || previewUri, baseUri || 'https://img.shields.io/', { longCache: false });

  return (
    <tr><th onClick={handleClick}>{ title }:</th>
      <td>{ previewImage }</td>
      <td><code onClick={handleClick}>{ resolvedExampleUri }</code></td>
    </tr>
  );
};
Badge.propTypes = {
  title: PropTypes.string.isRequired,
  previewUri: PropTypes.string,
  exampleUri: PropTypes.string,
  documentation: PropTypes.string,
  baseUri: PropTypes.string.isRequired,
  isProductionBuild: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const Category = ({ category, examples, baseUri, isProductionBuild, onClick }) => (
  <div>
    <h3 id={category.id}>{ category.name }</h3>
    <table className='badge'><tbody>
      {
        examples.map((badgeData, i) => (<Badge key={i} {...badgeData} baseUri={baseUri} isProductionBuild={isProductionBuild} onClick={onClick} />))
      }
    </tbody></table>
  </div>
);
Category.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  examples: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    previewUri: PropTypes.string,
    exampleUri: PropTypes.string,
    documentation: PropTypes.string,
  })).isRequired,
  baseUri: PropTypes.string.isRequired,
  isProductionBuild: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const BadgeExamples = ({ examples, baseUri, isProductionBuild, onClick }) => (
  <div>
    {
      examples.map((categoryData, i) => (<Category key={i} {...categoryData} baseUri={baseUri} isProductionBuild={isProductionBuild} onClick={onClick} />))
    }
  </div>
);
BadgeExamples.propTypes = {
  examples: PropTypes.arrayOf(PropTypes.shape({
    category: Category.propTypes.category,
    examples: Category.propTypes.examples,
  })),
  baseUri: PropTypes.string.isRequired,
  isProductionBuild: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

module.exports = {
  Badge,
  BadgeExamples,
  resolveUri,
};
