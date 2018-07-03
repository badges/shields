import React from 'react';
import { BadgeExamples } from '../frontend/components/badge-examples';
import ExamplesPage from '../frontend/components/examples-page';
import { baseUri, longCache } from '../frontend/constants';

export default class IndexPage extends ExamplesPage {

  getBody() {
    if ((this.state.query == null) || (this.state.query.length === 0)) {
      return this.preparedExamples.map(category => (
        <a href={'/examples/' + category.category.id}>
          <h3 id={category.category.id}>{ category.category.name }</h3>
        </a>
      ));
    } else if (this.state.query.length === 1) {
      return (
        <div>Search term must have 2 or more characters</div>
      );
    } else {
      return(<BadgeExamples
        categories={this.preparedExamples}
        onClick={example => { this.setState({ example }); }}
        baseUri={baseUri}
        longCache={longCache} />
      );
    }
  }

}
