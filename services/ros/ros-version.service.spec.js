import { expect } from 'chai'
import RosVersion from './ros-version.service.js'

describe('parseReleaseVersionFromDistro', function () {
  it('returns correct version', function () {
    expect(
      RosVersion._parseReleaseVersionFromDistro(
        `
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
type: distribution
version: 2
      `,
        'vision_msgs',
      ),
    ).to.equal('4.0.0')
  })
})
