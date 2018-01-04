import envFlag from 'node-env-flag';
import React from 'react';
import Meta from '../frontend/components/meta';
import Header from '../frontend/components/header';
import SuggestionAndSearch from '../frontend/components/suggestion-and-search';
import { BadgeExamples } from '../frontend/components/badge-examples';
import MarkupModal from '../frontend/components/markup-modal';
import Usage from '../frontend/components/usage';
import Footer from '../frontend/components/footer';
import badgeExampleData from '../lib/all-badge-examples';
import { prepareExamples, predicateFromQuery } from '../frontend/lib/prepare-examples';

const baseUri = process.env.BASE_URL;
const longCache = envFlag(process.env.LONG_CACHE, false);

export default class IndexPage extends React.Component {
  state = {
    query: null,
    example: null
  };

  constructor(props) {
    super(props);
    this.preparedExamples = prepareExamples(
      badgeExampleData,
      () => predicateFromQuery(this.state.query));
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
        <BadgeExamples
          categories={this.preparedExamples}
          onClick={example => { this.setState({ example }); }}
          baseUri={baseUri}
          longCache={longCache} />
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
