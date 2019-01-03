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
    /* background-color: #2684ff; */
    border-width: 0;
    box-shadow: unset;
  }

  .markup-format__value-container {
    cursor: copy;
  }

  /*
  .markup-format__placeholder {
    color: hsl(120, 0%, 95%);
  }
  */

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

  static theme({ borderRadius, colors, spacing }) {
    return {
      borderRadius,
      colors: {
        ...colors,
        //   neutral5: 'hsl(214, 100%, 100%)',
        //   neutral0: 'hsl(214, 100%, 57%)',
        //   neutral50: 'hsl(214, 100%, 50%)',
        //   // neutral50: 'hsl(120, 0%, 98%)',
        //   // neutral50: 'hsl(0, 0%, 50%)',
      },
      spacing,
    }
  }

  render() {
    const { isDisabled } = this.props

    return (
      <MarkupFormatSelect
        ref={this.selectRef}
        options={markupOptions}
        theme={this.constructor.theme}
        placeholder="Copy Badge URL"
        value=""
        isDisabled={isDisabled}
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
  isDisabled: PropTypes.bool,
}
export default GetMarkupButton
