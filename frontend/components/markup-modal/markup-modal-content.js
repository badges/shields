import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { H3 } from '../common'
import Customizer from '../customizer/customizer'

const Documentation = styled.div`
  max-width: 800px;
  margin: 35px auto 20px;
`

export default class MarkupModalContent extends React.Component {
  static propTypes = {
    // This is an item from the `examples` array within the
    // `serviceDefinition` schema.
    // https://github.com/badges/shields/blob/master/services/service-definitions.js
    example: PropTypes.object,
    baseUrl: PropTypes.string.isRequired,
  }

  renderDocumentation() {
    const {
      example: { documentation },
    } = this.props

    return documentation ? (
      <Documentation dangerouslySetInnerHTML={documentation} />
    ) : null
  }

  render() {
    const {
      example: {
        title,
        example: { pattern, namedParams, queryParams },
        preview: { style: defaultStyle },
      },
      baseUrl,
    } = this.props
    return (
      <>
        <H3>{title}</H3>
        {this.renderDocumentation()}
        <Customizer
          baseUrl={baseUrl}
          title={title}
          pattern={pattern}
          exampleNamedParams={namedParams}
          exampleQueryParams={queryParams}
          defaultStyle={defaultStyle}
        />
      </>
    )
  }
}
