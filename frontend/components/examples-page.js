import React from 'react'
import PropTypes from 'prop-types'
import Meta from './meta'
import Header from './header'
import SuggestionAndSearch from './suggestion-and-search'
import SearchResults from './search-results'
import MarkupModal from './markup-modal'
import Usage from './usage'
import Footer from './footer'
import { baseUri, longCache } from '../constants'

export default class ExamplesPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      category: props.match.params.id,
      query: null,
      example: null,
      searchReady: true,
    }
    this.searchTimeout = 0
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
        query: query,
      })
    }, 500)
  }

  renderSearchResults() {
    if (this.state.searchReady) {
      if (this.state.query != null && this.state.query.length === 1) {
        return <div>Search term must have 2 or more characters</div>
      } else {
        return (
          <SearchResults
            category={this.state.category}
            query={this.state.query}
            clickHandler={example => {
              this.setState({ example })
            }}
          />
        )
      }
    } else {
      return <div>searching...</div>
    }
  }

  render() {
    return (
      <div>
        <Meta />
        <Header />
        <MarkupModal
          example={this.state.example}
          onRequestClose={() => {
            this.setState({ example: null })
          }}
          baseUri={baseUri}
        />
        <section>
          <SuggestionAndSearch
            queryChanged={this.searchQueryChanged}
            onBadgeClick={example => {
              this.setState({ example })
            }}
            baseUri={baseUri}
            longCache={longCache}
          />
          <a className="donate" href="https://opencollective.com/shields">
            donate
          </a>
        </section>
        {this.renderSearchResults()}
        <Usage baseUri={baseUri} longCache={longCache} />
        <Footer baseUri={baseUri} />
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
