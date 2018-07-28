import React from 'react';
import { HashRouter, StaticRouter, Route } from "react-router-dom";
import ExamplesPage from '../frontend/components/examples-page';


export default class Router extends React.Component {

  render() {
    const router = (
      <div>
        <Route path="/" exact component={ExamplesPage} />
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
