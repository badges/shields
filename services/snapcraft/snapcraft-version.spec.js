import { expect } from 'chai'
import { test, given } from 'sazerac'
import _ from 'lodash'
import { NotFound } from '../index.js'
import SnapcraftVersion from './snapcraft-version.service.js'

describe('SnapcraftVersion', function () {
  const exampleChannel = {
    channel: {
      architecture: 'amd64',
      risk: 'stable',
      track: 'latest',
    },
    version: '1.2.3',
  }
  const exampleArchChange = _.merge(_.cloneDeep(exampleChannel), {
    channel: { architecture: 'arm64' },
    version: '2.3.4',
  })
  const exampleTrackChange = _.merge(_.cloneDeep(exampleChannel), {
    channel: { track: 'beta' },
    version: '3.4.5',
  })
  const exampleRiskChange = _.merge(_.cloneDeep(exampleChannel), {
    channel: { risk: 'edge' },
    version: '5.4.6',
  })
  const testApiData = {
    'channel-map': [
      exampleChannel,
      exampleArchChange,
      exampleTrackChange,
      exampleRiskChange,
    ],
  }

  test(SnapcraftVersion.transform, () => {
    given(
      testApiData,
      exampleChannel.channel.track,
      exampleChannel.channel.risk,
      exampleChannel.channel.architecture,
    ).expect(exampleChannel)
    // change arch
    given(
      testApiData,
      exampleChannel.channel.track,
      exampleChannel.channel.risk,
      exampleArchChange.channel.architecture,
    ).expect(exampleArchChange)
    // change track
    given(
      testApiData,
      exampleTrackChange.channel.track,
      exampleChannel.channel.risk,
      exampleChannel.channel.architecture,
    ).expect(exampleTrackChange)
    // change risk
    given(
      testApiData,
      exampleChannel.channel.track,
      exampleRiskChange.channel.risk,
      exampleChannel.channel.architecture,
    ).expect(exampleRiskChange)
  })

  it('throws NotFound error with missing arch', function () {
    expect(() => {
      SnapcraftVersion.transform(
        testApiData,
        exampleChannel.channel.track,
        exampleChannel.channel.risk,
        'missing',
      )
    })
      .to.throw(NotFound)
      .with.property('prettyMessage', 'arch not found')
  })
  it('throws NotFound error with missing track', function () {
    expect(() => {
      SnapcraftVersion.transform(
        testApiData,
        'missing',
        exampleChannel.channel.risk,
        exampleChannel.channel.architecture,
      )
    })
      .to.throw(NotFound)
      .with.property('prettyMessage', 'track not found')
  })
  it('throws NotFound error with missing risk', function () {
    expect(() => {
      SnapcraftVersion.transform(
        testApiData,
        exampleChannel.channel.track,
        'missing',
        exampleChannel.channel.architecture,
      )
    })
      .to.throw(NotFound)
      .with.property('prettyMessage', 'risk not found')
  })
})
