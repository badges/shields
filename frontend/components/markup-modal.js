import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import ClickToSelect from '@mapbox/react-click-to-select';
import { resolveUri } from './badge-examples';

export default class MarkupModal extends React.Component {
  propTypes = {
    example: PropTypes.shape({
      title: PropTypes.string.isRequired,
      previewUri: PropTypes.string,
      exampleUri: PropTypes.string,
      documentation: PropTypes.string,
      link: PropTypes.string,
    }),
    baseUri: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  };

  state = {
    isOpen: false,
    badgeUri: null,
    link: null,
    style: 'flat',
  };

  componentWillReceiveProps(nextProps) {
    const { example } = nextProps;
    if (example === null) {
      this.setState({
        isOpen: false,
        badgeUri: null,
      });
    } else {
      this.setState({
        isOpen: true,
        badgeUri: resolveUri(example.exampleUri || example.previewUri, nextProps.baseUri),
        link: example.link,
      });
    }
  }

  generateMarkup() {
    if (this.props.example === null) {
      return {};
    }

    const { title } = this.props.example;
    const { link, style } = this.state;

    let badgeUri = this.state.badgeUri;
    if (style !== 'flat') { // Default style doesn't need to be specified.
      badgeUri += badgeUri.includes('?') ? `&style=${style}` : `?style=${style}`;
    }

    return {
      markdown: `[![${title}](${badgeUri})](${link})`,
      reStructuredText: `.. image:: ${badgeUri}   :target: ${link}`,
      asciiDoc: `image:${badgeUri}[${title}]`,
    };
  }

  renderDocumentation() {
    const { documentation } = this.props.example || {};

    return documentation ? (
      <div>
        <h4>Documentation</h4>
        <div dangerouslySetInnerHTML={{ __html: documentation }} />
      </div>
    ) : null;
  }

  render() {
    const { markdown, reStructuredText, asciiDoc } = this.generateMarkup();

    return (
      <Modal
        isOpen={this.state.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel="Example Modal">
        <form action="">
          <p>
            <img src={this.state.badgeUri} style={{ minHeight: '20px' }} />
          </p>
          <p>
            <label>Link&nbsp;
              <input
                type="url"
                value={this.state.link}
                onChange={event => { this.setState({ link: event.target.value }); }} />
            </label>
          </p>
          <p>
            <label>Image&nbsp;
              <input
                type="url"
                value={this.state.badgeUri}
                onChange={event => { this.setState({ badgeUri: event.target.value }); }} />
            </label>
          </p>
          <p>
            <label>
              Style&nbsp;
              <select
                value={this.state.style}
                onChange={event => { this.setState({ style: event.target.value }); }}>
                <option value="plastic">plastic</option>
                <option value="flat">flat</option>
                <option value="flat-square">flat-square</option>
              </select>
            </label>
          </p>
          <p>
            Markdown&nbsp;
            <ClickToSelect>
              <input className="code" readOnly value={markdown} id="copyMarkdown" />
            </ClickToSelect>
          </p>
          <p>
            reStructuredText&nbsp;
            <ClickToSelect>
              <input className="code" readOnly value={reStructuredText} id="copyreStructuredText" />
            </ClickToSelect>
          </p>
          <p>
            AsciiDoc&nbsp;
            <ClickToSelect>
              <input className="code" readOnly value={asciiDoc} id="copyAsciiDoc" />
            </ClickToSelect>
          </p>
          {
            this.renderDocumentation()
          }
        </form>
      </Modal>
    );
  }
}
