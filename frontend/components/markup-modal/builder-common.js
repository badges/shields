import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const BuilderOuterContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`

// The inner container is inline-block so that its width matches its columns.
const BuilderInnerContainer = styled.div`
  display: inline-block;

  padding: 11px 14px 10px;

  border-radius: 4px;
  background: #eef;
`

const BuilderContainer = ({ children }) => (
  <BuilderOuterContainer>
    <BuilderInnerContainer>{children}</BuilderInnerContainer>
  </BuilderOuterContainer>
)
BuilderContainer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

const labelFont = `
  font-family: system-ui;
  font-size: 11px;
  text-transform: lowercase;
`

const BuilderLabel = styled.label`
  ${labelFont}
`

const BuilderCaption = styled.span`
  ${labelFont}

  color: #999;
`

export { BuilderContainer, BuilderLabel, BuilderCaption }
