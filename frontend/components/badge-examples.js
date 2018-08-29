import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import resolveBadgeUrl from '../lib/badge-url'

const Badge = ({
  title,
  exampleUrl,
  previewUrl,
  urlPattern,
  documentation,
  baseUrl,
  longCache,
  shouldDisplay = () => true,
  onClick,
}) => {
  const handleClick = onClick
    ? () =>
        onClick({
          title,
          exampleUrl,
          previewUrl,
          urlPattern,
          documentation,
        })
    : undefined

  const previewImage = previewUrl ? (
    <img
      className={classNames('badge-img', { clickable: onClick })}
      onClick={handleClick}
      src={resolveBadgeUrl(previewUrl, baseUrl, { longCache })}
      alt=""
    />
  ) : (
    '\u00a0'
  ) // non-breaking space
  const resolvedExampleUrl = resolveBadgeUrl(
    urlPattern || previewUrl,
    baseUrl,
    { longCache: false }
  )

  if (shouldDisplay()) {
    return (
      <tr>
        <th
          className={classNames({ clickable: onClick })}
          onClick={handleClick}
        >
          {title}:
        </th>
        <td>{previewImage}</td>
        <td>
          <code
            className={classNames({ clickable: onClick })}
            onClick={handleClick}
          >
            {resolvedExampleUrl}
          </code>
        </td>
      </tr>
    )
  }
  return null
}
Badge.propTypes = {
  title: PropTypes.string.isRequired,
  exampleUrl: PropTypes.string,
  previewUrl: PropTypes.string,
  urlPattern: PropTypes.string,
  documentation: PropTypes.string,
  baseUrl: PropTypes.string,
  longCache: PropTypes.bool.isRequired,
  shouldDisplay: PropTypes.func,
  onClick: PropTypes.func.isRequired,
}

const Category = ({ category, examples, baseUrl, longCache, onClick }) => {
  if (examples.filter(example => example.shouldDisplay()).length === 0) {
    return null
  }
  return (
    <div>
      <Link to={'/examples/' + category.id}>
        <h3 id={category.id}>{category.name}</h3>
      </Link>
      <table className="badge">
        <tbody>
          {examples.map(badgeData => (
            <Badge
              key={badgeData.key}
              {...badgeData}
              baseUrl={baseUrl}
              longCache={longCache}
              onClick={onClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
Category.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      exampleUrl: PropTypes.string,
      previewUrl: PropTypes.string,
      urlPattern: PropTypes.string,
      documentation: PropTypes.string,
    })
  ).isRequired,
  baseUrl: PropTypes.string,
  longCache: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}

const BadgeExamples = ({ categories, baseUrl, longCache, onClick }) => (
  <div>
    {categories.map((categoryData, i) => (
      <Category
        key={i}
        {...categoryData}
        baseUrl={baseUrl}
        longCache={longCache}
        onClick={onClick}
      />
    ))}
  </div>
)
BadgeExamples.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      category: Category.propTypes.category,
      examples: Category.propTypes.examples,
    })
  ),
  baseUrl: PropTypes.string,
  longCache: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}

export { Badge, BadgeExamples }
