import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Select, { components } from 'react-select'
import { generateMarkup } from '../../lib/generate-image-markup'

const ClickablePlaceholder = props => (
  <components.Placeholder
    {...props}
    innerProps={{
      onClick: props.selectProps.onPlaceholderClick,
    }}
  />
)

const MarkupFormatSelect = styled(Select)`
  width: 200px;

  margin-left: auto;
  margin-right: auto;

  font-weight: 700;

  .markup-format__control {
    background-color: #2684ff;
    border-width: 0;
    box-shadow: unset;
  }

  .markup-format__value-container {
    cursor: copy;
  }

  .markup-format__placeholder {
    color: hsl(120, 0%, 95%);
  }

  .markup-format__option {
    text-align: left;
    cursor: copy;
  }
`

const markupOptions = [
  { value: 'markdown', label: 'Copy Markdown' },
  { value: 'rst', label: 'Copy reStructuredText' },
  { value: 'asciidoc', label: 'Copy AsciiDoc' },
  { value: 'html', label: 'Copy HTML' },
]

class GetMarkupButton extends React.PureComponent {
  selectRef = React.createRef()

  onPlaceholderClick = () => {
    const { selectRef } = this
    const { onMarkupRequested } = this.props
    if (onMarkupRequested) {
      onMarkupRequested('link')
    }
    selectRef.current.blur()
  }

  onOptionClick = ({ value: markupFormat }) => {
    const { onMarkupRequested } = this.props
    if (onMarkupRequested) {
      onMarkupRequested(markupFormat)
    }
  }

  render() {
    return (
      <MarkupFormatSelect
        ref={this.selectRef}
        options={markupOptions}
        placeholder="Copy Badge URL"
        value=""
        closeMenuOnScroll
        openMenuOnFocus={false}
        openMenuOnClick={false}
        blurInputOnSelect
        menuPlacement="auto"
        isSearchable={false}
        onPlaceholderClick={this.onPlaceholderClick}
        onChange={this.onOptionClick}
        classNamePrefix="markup-format"
        components={{
          Placeholder: ClickablePlaceholder,
        }}
      />
    )
  }
}
GetMarkupButton.propTypes = {
  onMarkupRequested: PropTypes.func.isRequired,
}
export default GetMarkupButton
