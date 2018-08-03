import { NavLink } from "react-router-dom";
import React from 'react';
import { getCategoryHeadings } from '../lib/prepare-examples';

export default class Menu extends React.Component {

  renderMenu() {
    return getCategoryHeadings().map(function(category) {
      return (
        <li key={category.id}>
          <NavLink
            to={'/examples/' + category.id}
            activeClassName='active'>
            { category.name }
          </NavLink>
        </li>
      )
    });
  }

  render() {
    return (
      <nav id="nav">
        <ul>
          { this.renderMenu() }
        </ul>
      </nav>
    );
  }

}
