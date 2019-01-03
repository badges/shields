import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { H3 } from './common'

const CategoryHeading = ({ category }) => {
  const { id, name } = category

  return (
    <Link to={`/examples/${id}`}>
      <H3 id={id}>{name}</H3>
    </Link>
  )
}
CategoryHeading.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
}

const CategoryHeadings = ({ categories }) => (
  <div>
    {categories.map(category => (
      <CategoryHeading category={category} key={category.id} />
    ))}
  </div>
)
CategoryHeadings.propTypes = {
  categories: PropTypes.arrayOf(CategoryHeading.propTypes.category).isRequired,
}

export { CategoryHeading, CategoryHeadings }
