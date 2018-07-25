import React from 'react';
import PropTypes from 'prop-types';
import Meta from './meta';
import Header from './header';
import SuggestionAndSearch from './suggestion-and-search';
import { BadgeExamples } from './badge-examples';
import MarkupModal from './markup-modal';
import Usage from './usage';
import Footer from './footer';
import badgeExampleData from '../../badge-examples.json';
import { prepareExamples, predicateFromQuery } from '../lib/prepare-examples';
import { baseUri, longCache } from '../constants';

export default class ExamplesPage extends React.Component {
  state = {
    query: null,
    example: null
  };

  static propTypes = {
    match: PropTypes.object.isRequired,
  }

  prepareExamples(category) {
    const examples = category ? badgeExampleData.filter(example => example.category.id === category) : badgeExampleData;
    return prepareExamples(examples, () => predicateFromQuery(this.state.query));
  }

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples(props.match.params.id);
  }

  getBody() {
    return(<BadgeExamples
      categories={this.preparedExamples}
      onClick={example => { this.setState({ example }); }}
      baseUri={baseUri}
      longCache={longCache} />
    );
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
            queryChanged={query => { this.setState({ query }); }}
            onBadgeClick={example => { this.setState({ example }); }}
            baseUri={baseUri}
            longCache={longCache} />
          <a
            className="donate"
            href="https://opencollective.com/shields">
            donate
          </a>
        </section>
        { this.getBody() }
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
