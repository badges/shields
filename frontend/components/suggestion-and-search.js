import React from 'react';
import PropTypes from 'prop-types';
import fetchPonyfill from 'fetch-ponyfill';
import debounce from 'lodash.debounce';
import { Badge } from './badge-examples';

export default class SuggestionAndSearch extends React.Component {
  static propTypes = {
    queryChanged: PropTypes.func.isRequired,
    onBadgeClick: PropTypes.func.isRequired,
    baseUri: PropTypes.string.isRequired,
    isProductionBuild: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.queryChangedDebounced = debounce(props.queryChanged, 500, { leading: true });
  }

  state = {
    isUrl: false,
    inProgress: false,
    projectUrl: null,
    suggestions: [],
  };

  queryChanged(query) {
    const isUri = query.startsWith('https://') || query.startsWith('http://');
    this.setState({
      isUri,
      projectUri: isUri ? query : null,
    });

    this.queryChangedDebounced(query);
  }

  getSuggestions() {
    this.setState({ inProgress: true }, () => {
      const { baseUri } = this.props;
      const { projectUri } = this.state;

      const url = new URL('/$suggest/v1', baseUri);
      url.searchParams.set('url', projectUri);

      const fetch = window.fetch || fetchPonyfill;
      fetch(url)
        .then(res => res.json())
        .then(json => {
          this.setState({ inProgress: false, suggestions: json.badges });
        })
        .catch(() => {
          this.setState({ inProgress: false, suggestions: [] });
        });
    });
  }

  renderSuggestions() {
    const { baseUri, isProductionBuild } = this.props;
    const { suggestions } = this.state;

    if (suggestions.length === 0) {
      return null;
    }

    return (
      <table className="badge"><tbody>
        { suggestions.map(({ name, link, badge }, i) => (
          // TODO We need to deal with `link`.
          <Badge
            key={i}
            title={name}
            previewUri={badge}
            onClick={() => this.props.onBadgeClick({
              title: name,
              previewUri: badge,
              link,
            })}
            baseUri={baseUri}
            isProductionBuild={isProductionBuild} />
        ))}
      </tbody></table>
    );
  }

  render() {
    const showSuggestButton = this.state.isUri && ! this.state.inProgress;

    return (
      <section>
        <form action="javascript:void 0" autoComplete="off">
          <input
            onChange={event => this.queryChanged(event.target.value)}
            autofill="off" autoFocus
            placeholder="search / project URL" />
          <br />
          <button
            onClick={event => this.getSuggestions(event.target.value)}
            hidden={! showSuggestButton}>
            Suggest badges
          </button>
        </form>
        { this.renderSuggestions() }
      </section>
    );
  }
}
