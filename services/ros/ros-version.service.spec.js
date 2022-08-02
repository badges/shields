import { expect } from 'chai'
import RosVersion from './ros-version.service.js'

const exampleDistro = `
%YAML 1.1
# ROS distribution file
# see REP 143: http://ros.org/reps/rep-0143.html
---
release_platforms:
  debian:
  - bullseye
  rhel:
  - '8'
  ubuntu:
  - jammy
repositories:
  vision_msgs:
    doc:
      type: git
      url: https://github.com/ros-perception/vision_msgs.git
      version: ros2
    release:
      tags:
        release: release/humble/{package}/{version}
      url: https://github.com/ros2-gbp/vision_msgs-release.git
      version: 4.0.0-2
    source:
      test_pull_requests: true
      type: git
      url: https://github.com/ros-perception/vision_msgs.git
      version: ros2
    status: developed
  navigation_2d:
    doc:
      type: git
      url: https://github.com/skasperski/navigation_2d.git
      version: noetic
    release:
      packages:
      - nav2d
      - nav2d_exploration
      - nav2d_karto
      - nav2d_localizer
      - nav2d_msgs
      - nav2d_navigator
      - nav2d_operator
      - nav2d_remote
      - nav2d_tutorials
      tags:
        release: release/noetic/{package}/{version}
      url: https://github.com/skasperski/navigation_2d-release.git
      version: 0.4.3-1
    source:
      type: git
      url: https://github.com/skasperski/navigation_2d.git
      version: noetic
    status: maintained
type: distribution
version: 2
`
describe('parseReleaseVersionFromDistro', function () {
  it('returns correct version', function () {
    expect(
      RosVersion._parseReleaseVersionFromDistro(exampleDistro, 'vision_msgs')
    ).to.equal('4.0.0')
  })

  it('handles repos with multiple packages', function () {
    expect(
      RosVersion._parseReleaseVersionFromDistro(exampleDistro, 'nav2d')
    ).to.equal('0.4.3')
    expect(() =>
      RosVersion._parseReleaseVersionFromDistro(exampleDistro, 'navigation_2d')
    ).to.throw('package not found: navigation_2d')
  })
})
