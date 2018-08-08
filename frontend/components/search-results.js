import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { BadgeExamples } from './badge-examples'
import badgeExampleData from '../../badge-examples.json'
import { prepareExamples, predicateFromQuery } from '../lib/prepare-examples'
import { baseUri, longCache } from '../constants'

export default class SearchResults extends React.Component {
  static propTypes = {
    category: PropTypes.string,
    query: PropTypes.string,
    clickHandler: PropTypes.func.isRequired,
  }

  prepareExamples(category) {
    const examples = category
      ? badgeExampleData.filter(example => example.category.id === category)
      : badgeExampleData
    return prepareExamples(examples, () => predicateFromQuery(this.props.query))
  }

  renderExamples() {
    return (
      <BadgeExamples
        categories={this.preparedExamples}
        onClick={this.props.clickHandler}
        baseUri={baseUri}
        longCache={longCache}
      />
    )
  }

  renderCategoryHeadings() {
    return this.preparedExamples.map(function(category, i) {
      return (
        <Link
          to={'/examples/' + category.category.id}
          key={category.category.id}
        >
          <h3 id={category.category.id}>{category.category.name}</h3>
        </Link>
      )
    })
  }

  render() {
    this.preparedExamples = this.prepareExamples(this.props.category)

    if (this.props.category) {
      return this.renderExamples()
    } else if (this.props.query == null || this.props.query.length === 0) {
      return this.renderCategoryHeadings()
    } else {
      return this.renderExamples()
    }
  }
}
