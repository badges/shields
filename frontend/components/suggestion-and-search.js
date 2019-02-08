import React from 'react'
import PropTypes from 'prop-types'
import fetchPonyfill from 'fetch-ponyfill'
import debounce from 'lodash.debounce'
import resolveUrl from '../lib/resolve-url'
import BadgeExamples from './badge-examples'
import { BlockInput } from './common'

export default class SuggestionAndSearch extends React.Component {
  static propTypes = {
    queryChanged: PropTypes.func.isRequired,
    onBadgeClick: PropTypes.func.isRequired,
    baseUrl: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props)
    this.queryChangedDebounced = debounce(props.queryChanged, 50, {
      leading: true,
    })
  }

  state = {
    isUrl: false,
    inProgress: false,
    projectUrl: null,
    suggestions: [],
  }

  queryChanged(query) {
    const isUrl = query.startsWith('https://') || query.startsWith('http://')
    this.setState({
      isUrl,
      projectUrl: isUrl ? query : null,
    })

    this.queryChangedDebounced(query)
  }

  getSuggestions() {
    this.setState({ inProgress: true }, async () => {
      const { baseUrl } = this.props
      const { projectUrl } = this.state

      const url = resolveUrl('/$suggest/v1', baseUrl, { url: projectUrl })

      const fetch = window.fetch || fetchPonyfill
      const res = await fetch(url)
      let suggestions
      try {
        const json = await res.json()
        // This doesn't validate the response. The default value here prevents
        // a crash if the server returns {"err":"Disallowed"}.
        suggestions = json.suggestions || []
      } catch (e) {
        suggestions = []
      }

      this.setState({ inProgress: false, suggestions })
    })
  }

  renderSuggestions() {
    const { baseUrl } = this.props
    const { suggestions } = this.state

    if (suggestions.length === 0) {
      return null
    }

    const transformed = [
      {
        examples: suggestions.map(({ title, path, link, queryParams }) => ({
          title,
          preview: { path, queryParams },
          example: { path, queryParams },
          link,
        })),
      },
    ]

    return (
      <BadgeExamples
        definitions={transformed}
        baseUrl={baseUrl}
        onClick={this.props.onBadgeClick}
      />
    )
  }

  render() {
    return (
      <section>
        <form action="javascript:void 0" autoComplete="off">
          <BlockInput
            onChange={event => this.queryChanged(event.target.value)}
            autofill="off"
            autoFocus
            placeholder="search / project URL"
          />
          <br />
          <button
            onClick={event => this.getSuggestions(event.target.value)}
            disabled={this.state.inProgress}
            hidden={!this.state.isUrl}
          >
            Suggest badges
          </button>
        </form>
        {this.renderSuggestions()}
      </section>
    )
  }
}
