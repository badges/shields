import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import { Badge } from './badge-examples';

function toXhrSend(data) {
  let str = '', start = true;
  let jsondata = '';
  for (const key in data) {
    if (typeof (jsondata = JSON.stringify(data[key])) === 'string') {
      str += start ? '' : '&';
      if (typeof data[key] === 'string') {
        str += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
      } else {
        str += encodeURIComponent(key) + '=' + encodeURIComponent(jsondata);
      }
      start = false;
    }
  }
  return str;
}

function ajax(baseUri, verb, adverbs, cb) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', baseUri + "/$" + verb + '?' + toXhrSend(adverbs), true);
  xhr.onload = e => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          cb(null, JSON.parse(xhr.responseText));
        } catch(e) {
          cb(e);
        }
      }
    }
  };
  xhr.onerror = e => { cb(Error(xhr.statusText)); };
  xhr.send(null);
}

export default class SuggestionAndSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isUrl: false,
      inProgress: false,
      projectUrl: null,
      suggestions: [],
    };

    this.queryChangedDebounced = debounce(props.queryChanged, 500, { leading: true });
  }

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
      ajax(
        this.props.baseUri,
        'suggest/v1',
        { url: this.state.projectUri },
        (err, res) => {
          this.setState({
            inProgress: false,
            suggestions: err ? [] : res.badges,
          });
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
SuggestionAndSearch.propTypes = {
  queryChanged: PropTypes.func.isRequired,
  onBadgeClick: PropTypes.func.isRequired,
  baseUri: PropTypes.string.isRequired,
  isProductionBuild: PropTypes.bool.isRequired,
};
