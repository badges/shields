import React from 'react';
import PropTypes from 'prop-types';
import Meta from './meta';
import Header from './header';
import SuggestionAndSearch from './suggestion-and-search';
import SearchResults from './search-results';
import MarkupModal from './markup-modal';
import Usage from './usage';
import Footer from './footer';
import { baseUri, longCache } from '../constants';

export default class ExamplesPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      category: props.match.params.id,
      query: null,
      example: null,
      searchReady: true,
    };
    this.searchTimeout = 0;
    this.renderSearchResults = this.renderSearchResults.bind(this);
    this.searchQueryChanged = this.searchQueryChanged.bind(this);
  }

  static propTypes = {
    match: PropTypes.object.isRequired,
  }

  searchQueryChanged(query) {
    this.setState({searchReady: false});
    window.clearTimeout(this.searchTimeout);
    this.searchTimeout = window.setTimeout(function() {
      this.setState({
        searchReady: true,
        query: query
      });
    }.bind(this), 500);
  }

  renderSearchResults() {
    if (this.state.searchReady) {
      return (
        <SearchResults
          category={this.state.category}
          query={this.state.query}
          clickHandler={example => { this.setState({ example }); }} />
      );
    } else {
      return 'searching...';
    }
  }

  render() {
    return (
      <div>
        <Meta />
        <Header />
        <MarkupModal
          example={this.state.example}
          onRequestClose={() => { this.setState({ example: null }); }}
          baseUri={baseUri} />
        <section>
          <SuggestionAndSearch
            queryChanged={this.searchQueryChanged}
            onBadgeClick={example => { this.setState({ example }); }}
            baseUri={baseUri}
            longCache={longCache} />
          <a
            className="donate"
            href="https://opencollective.com/shields">
            donate
          </a>
        </section>
        { this.renderSearchResults() }
        <Usage
          baseUri={baseUri}
          longCache={longCache} />
        <Footer baseUri={baseUri} />
        <style jsx>{`
          .donate {
            text-decoration: none;
            color: rgba(0,0,0,0.1);
          }
        `}</style>
      </div>
    );
  }
}
