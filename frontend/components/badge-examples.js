import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import resolveBadgeUrl from '../lib/badge-url';

const Badge = ({
  title,
  previewUri,
  exampleUri,
  documentation,
  baseUri,
  longCache,
  shouldDisplay = () => true,
  onClick,
}) => {
  const handleClick = onClick ?
    () => onClick({ title, previewUri, exampleUri, documentation })
    : undefined;

  const previewImage = previewUri
    ? (<img
      className={classNames('badge-img', { clickable: onClick })}
      onClick={handleClick}
      src={resolveBadgeUrl(previewUri, baseUri, { longCache } )}
      alt="" />
    ) : '\u00a0'; // non-breaking space
  const resolvedExampleUri = resolveBadgeUrl(
    exampleUri || previewUri,
    baseUri,
    { longCache: false });

  return (
    <tr className={classNames({ excluded: !shouldDisplay() })}>
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
  baseUri: PropTypes.string,
  longCache: PropTypes.bool.isRequired,
  shouldDisplay: PropTypes.func,
  onClick: PropTypes.func.isRequired,
};

const Category = ({ category, examples, baseUri, longCache, onClick }) => (
  <div>
    <h3 id={category.id}>{ category.name }</h3>
    <table className="badge">
      <tbody>
        {
          examples.map(badgeData => (
            <Badge
              key={badgeData.key}
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
  baseUri: PropTypes.string,
  longCache: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const BadgeExamples = ({ categories, baseUri, longCache, onClick }) => (
  <div>
    {
      categories.map((categoryData, i) => (
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
  categories: PropTypes.arrayOf(PropTypes.shape({
    category: Category.propTypes.category,
    examples: Category.propTypes.examples,
  })),
  baseUri: PropTypes.string,
  longCache: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export {
  Badge,
  BadgeExamples,
};
