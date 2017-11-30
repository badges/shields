import URLPath from 'url-path';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function resolveUri (uri, baseUri, options) {
  const { longCache } = options || {};
  const result = new URLPath(uri, baseUri);
  if (longCache) {
    result.searchParams.set('maxAge', '2592000');
  }
  return result.href;
}

const Badge = ({ title, previewUri, exampleUri, documentation, baseUri, longCache, onClick }) => {
  const handleClick = onClick ?
    () => onClick({ title, previewUri, exampleUri, documentation })
    : undefined;

  const previewImage = previewUri
    ? (<img
      className={classNames('badge-img', { clickable: onClick })}
      onClick={handleClick}
      src={resolveUri(previewUri, baseUri, { longCache } )}
      alt="" />
    ) : '\u00a0'; // non-breaking space
  const resolvedExampleUri = resolveUri(
    exampleUri || previewUri,
    baseUri || 'https://img.shields.io/',
    { longCache: false });

  return (
    <tr>
      <th className={classNames({ clickable: onClick })} onClick={handleClick}>
        { title }:
      </th>
      <td>{ previewImage }</td>
      <td>
        <code className={classNames({ clickable: onClick })} onClick={handleClick}>
          { resolvedExampleUri }
        </code>
      </td>
    </tr>
  );
};
Badge.propTypes = {
  title: PropTypes.string.isRequired,
  previewUri: PropTypes.string,
  exampleUri: PropTypes.string,
  documentation: PropTypes.string,
  baseUri: PropTypes.string.isRequired,
  longCache: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const Category = ({ category, examples, baseUri, longCache, onClick }) => (
  <div>
    <h3 id={category.id}>{ category.name }</h3>
    <table className="badge">
      <tbody>
        {
          examples.map((badgeData, i) => (
            <Badge
              key={i}
              {...badgeData}
              baseUri={baseUri}
              longCache={longCache}
              onClick={onClick} />
          ))
        }
      </tbody>
    </table>
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
  longCache: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const BadgeExamples = ({ examples, baseUri, longCache, onClick }) => (
  <div>
    {
      examples.map((categoryData, i) => (
        <Category
          key={i}
          {...categoryData}
          baseUri={baseUri}
          longCache={longCache}
          onClick={onClick} />
      ))
    }
  </div>
);
BadgeExamples.propTypes = {
  examples: PropTypes.arrayOf(PropTypes.shape({
    category: Category.propTypes.category,
    examples: Category.propTypes.examples,
  })),
  baseUri: PropTypes.string.isRequired,
  longCache: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

module.exports = {
  Badge,
  BadgeExamples,
  resolveUri,
};
