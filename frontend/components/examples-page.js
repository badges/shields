import React from 'react'
import PropTypes from 'prop-types'
import Meta from './meta'
import Header from './header'
import SuggestionAndSearch from './suggestion-and-search'
import SearchResults from './search-results'
import MarkupModal from './markup-modal'
import Usage from './usage'
import Footer from './footer'
import { baseUrl, longCache } from '../constants'

export default class ExamplesPage extends React.Component {
  constructor(props) {
    super(props)

    const { category } = props.match.params

    this.state = {
      category,
      query: undefined,
      selectedExample: undefined,
      searchReady: true,
    }

    this.searchTimeout = 0

    this.handleExampleSelected = this.handleExampleSelected.bind(this)
    this.dismissMarkupModal = this.dismissMarkupModal.bind(this)
    this.renderSearchResults = this.renderSearchResults.bind(this)
    this.searchQueryChanged = this.searchQueryChanged.bind(this)
  }

  static propTypes = {
    match: PropTypes.object.isRequired,
  }

  searchQueryChanged(query) {
    this.setState({ searchReady: false })

    /*
    Add a small delay before showing search results
    so that we wait until the user has stipped typing
    before we start loading stuff.

    This
    a) reduces the amount of badges we will load and
    b) stops the page from 'flashing' as the user types, like this:
    https://user-images.githubusercontent.com/7288322/42600206-9b278470-85b5-11e8-9f63-eb4a0c31cb4a.gif
    */
    window.clearTimeout(this.searchTimeout)
    this.searchTimeout = window.setTimeout(() => {
      this.setState({
        searchReady: true,
        query,
      })
    }, 500)
  }

  handleExampleSelected(example) {
    this.setState({ selectedExample: example })
  }

  dismissMarkupModal() {
    this.setState({ selectedExample: undefined })
  }

  renderSearchResults() {
    const { searchReady, query, category } = this.state

    if (searchReady) {
      if (query !== undefined && query.length === 1) {
        return <div>Search term must have 2 or more characters</div>
      } else {
        return (
          <SearchResults
            category={this.state.category}
            query={this.state.query}
            clickHandler={this.handleExampleSelected}
          />
        )
      }
    } else {
      return <div>searching...</div>
    }
  }

  render() {
    const { selectedExample } = this.state

    return (
      <div>
        <Meta />
        <Header />
        <MarkupModal
          example={selectedExample}
          onRequestClose={this.dismissMarkupModal}
          baseUrl={baseUrl}
          key={selectedExample}
        />
        <section>
          <SuggestionAndSearch
            queryChanged={this.searchQueryChanged}
            onBadgeClick={this.handleExampleSelected}
            baseUrl={baseUrl}
            longCache={longCache}
          />
          <a className="donate" href="https://opencollective.com/shields">
            donate
          </a>
        </section>
        {this.renderSearchResults()}
        <Usage baseUrl={baseUrl} longCache={longCache} />
        <Footer baseUrl={baseUrl} />
        <style jsx>{`
          .donate {
            text-decoration: none;
            color: rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    )
  }
}
