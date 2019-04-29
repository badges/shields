import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import groupBy from 'lodash.groupby'
import {
  categories,
  findCategory,
  services,
  getDefinitionsForCategory,
} from '../lib/service-definitions'
import ServiceDefinitionSetHelper from '../lib/service-definitions/service-definition-set-helper'
import { baseUrl } from '../constants'
import Meta from './meta'
import Header from './header'
import SuggestionAndSearch from './suggestion-and-search'
import DonateBox from './donate'
import MarkupModal from './markup-modal'
import Usage from './usage'
import Footer from './footer'
import {
  CategoryHeading,
  CategoryHeadings,
  CategoryNav,
} from './category-headings'
import BadgeExamples from './badge-examples'
import { BaseFont, GlobalStyle } from './common'

const AppContainer = styled(BaseFont)`
  text-align: center;
`

export default class Main extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isSearchInProgress: false,
      isQueryTooShort: false,
      searchResults: undefined,
      selectedExample: undefined,
    }

    this.searchTimeout = 0

    this.handleExampleSelected = this.handleExampleSelected.bind(this)
    this.dismissMarkupModal = this.dismissMarkupModal.bind(this)
    this.searchQueryChanged = this.searchQueryChanged.bind(this)
  }

  static propTypes = {
    // `pageContext` is the `context` passed to `createPage()` in
    // `gatsby-node.js`. In the case of the index page, `pageContext` is empty.
    pageContext: {
      category: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }),
    }.isRequired,
  }

  performSearch(query) {
    const isQueryTooShort = query.length === 1

    let searchResults
    if (query.length >= 2) {
      const flat = ServiceDefinitionSetHelper.create(services)
        .notDeprecated()
        .search(query)
        .toArray()
      searchResults = groupBy(flat, 'category')
    }

    this.setState({
      isSearchInProgress: false,
      isQueryTooShort,
      searchResults,
    })
  }

  searchQueryChanged(query) {
    /*
    Add a small delay before showing search results
    so that we wait until the user has stopped typing
    before we start loading stuff.

    This
    a) reduces the amount of badges we will load and
    b) stops the page from 'flashing' as the user types, like this:
    https://user-images.githubusercontent.com/7288322/42600206-9b278470-85b5-11e8-9f63-eb4a0c31cb4a.gif
    */
    this.setState({ isSearchInProgress: true })
    window.clearTimeout(this.searchTimeout)
    this.searchTimeout = window.setTimeout(() => this.performSearch(query), 500)
  }

  handleExampleSelected(example) {
    this.setState({ selectedExample: example })
  }

  dismissMarkupModal() {
    this.setState({ selectedExample: undefined })
  }

  renderCategory(category, definitions) {
    const { id } = category

    const flattened = definitions
      .reduce((accum, current) => {
        const { examples } = current
        return accum.concat(examples)
      }, [])
      .map(({ title, link, example, preview, documentation }) => ({
        title,
        link,
        example,
        preview,
        documentation,
      }))

    return (
      <div key={id}>
        <CategoryHeading category={category} />
        <BadgeExamples
          baseUrl={baseUrl}
          examples={flattened}
          onClick={this.handleExampleSelected}
        />
      </div>
    )
  }

  renderMain() {
    const {
      pageContext: { category },
    } = this.props
    const { isSearchInProgress, isQueryTooShort, searchResults } = this.state

    if (isSearchInProgress) {
      return <div>searching...</div>
    } else if (isQueryTooShort) {
      return <div>Search term must have 2 or more characters</div>
    } else if (searchResults) {
      return Object.entries(searchResults).map(([categoryId, definitions]) =>
        this.renderCategory(findCategory(categoryId), definitions)
      )
    } else if (category) {
      const definitions = ServiceDefinitionSetHelper.create(
        getDefinitionsForCategory(category.id)
      )
        .notDeprecated()
        .toArray()
      return (
        <div>
          <CategoryNav categories={categories} />
          {this.renderCategory(category, definitions)}
        </div>
      )
    } else {
      return <CategoryHeadings categories={categories} />
    }
  }

  render() {
    const { selectedExample } = this.state

    return (
      <AppContainer id="app">
        <GlobalStyle />
        <Meta />
        <Header />
        <MarkupModal
          baseUrl={baseUrl}
          example={selectedExample}
          onRequestClose={this.dismissMarkupModal}
        />
        <section>
          <SuggestionAndSearch
            baseUrl={baseUrl}
            onBadgeClick={this.handleExampleSelected}
            queryChanged={this.searchQueryChanged}
          />
          <DonateBox />
        </section>
        {this.renderMain()}
        <Usage baseUrl={baseUrl} />
        <Footer baseUrl={baseUrl} />
      </AppContainer>
    )
  }
}
