import React from 'react';
import { HashRouter, StaticRouter, Route, Link } from "react-router-dom";
import { BadgeExamples } from '../frontend/components/badge-examples';
import ExamplesPage from '../frontend/components/examples-page';
import { baseUri, longCache } from '../frontend/constants';

class IndexPage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.state.searchReady = false;
    this.searchTimeout = 0;
  }

  getBody() {
    if ((this.state.query == null) || (this.state.query.length === 0)) {
      return this.preparedExamples.map(function(category, i) {
        return (
          <Link to={'/examples/' + category.category.id} key={i}>
            <h3 id={category.category.id}>{ category.category.name }</h3>
          </Link>
        )
      });
    } else if (this.state.query.length === 1) {
      return (
        <div>Search term must have 2 or more characters</div>
      );
    } else {
      if (this.state.searchReady) {
        this.state.searchReady = false;
        return(<BadgeExamples
          categories={this.preparedExamples}
          onClick={example => { this.setState({ example }); }}
          baseUri={baseUri}
          longCache={longCache} />
        );
      } else {
        window.clearTimeout(this.searchTimeout);
        this.searchTimeout = window.setTimeout(function() {
          this.setState({searchReady: true});
        }.bind(this), 500);
        return 'searching...';
      }
    }
  }

}


export default class Router extends React.Component {

  render() {
    const router = (
      <div>
        <Route path="/" exact component={IndexPage} />
        <Route path="/examples/:id" component={ExamplesPage} />
      </div>
    );
    if (typeof window !== 'undefined') {
      return (<HashRouter>{ router }</HashRouter>);
    } else {
      const context = {};
      return (<StaticRouter context={context}>{ router }</StaticRouter>);
    }
  }

}
