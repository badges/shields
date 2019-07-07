import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { examplePropType } from '../../lib/service-definitions/example-prop-types'
import { H3 } from '../common'
import Customizer from '../customizer/customizer'

const Documentation = styled.div`
  max-width: 800px;
  margin: 35px auto 20px;
`

export default function MarkupModalContent({ example, baseUrl }) {
  const {
    title,
    documentation,
    example: { pattern, namedParams, queryParams },
    link,
    preview: { style: initialStyle } = {},
    isBadgeSuggestion,
  } = example

  return (
    <>
      <H3>{title}</H3>
      {documentation ? (
        <Documentation dangerouslySetInnerHTML={documentation} />
      ) : null}
      <Customizer
        baseUrl={baseUrl}
        exampleNamedParams={namedParams}
        exampleQueryParams={queryParams}
        initialStyle={initialStyle}
        isPrefilled={isBadgeSuggestion}
        link={link}
        pattern={pattern}
        title={title}
      />
    </>
  )
}
MarkupModalContent.propTypes = {
  example: examplePropType,
  baseUrl: PropTypes.string.isRequired,
}
