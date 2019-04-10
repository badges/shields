import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import pathToRegexp from 'path-to-regexp'
import { objectOfKeyValuesPropType } from '../../lib/service-definitions/service-definition-prop-types'
import { BuilderContainer } from './builder-common'

const PathLiteral = styled.div`
  margin-top: 10px;
`

export default class Path extends React.Component {
  static propTypes = {
    pattern: PropTypes.string.isRequired,
    namedParams: objectOfKeyValuesPropType,
  }

  render() {
    const toPath = pathToRegexp.compile(this.props.pattern)
    const path = toPath(this.props.namedParams)
    return (
      <BuilderContainer>
        <PathLiteral>{path}</PathLiteral>
      </BuilderContainer>
    )
  }
}
