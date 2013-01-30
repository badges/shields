# Shields

A coherent info-badge solution for codebases.

![shields on white](https://raw.github.com/olivierlacan/shields/master/shields_white.png)

Supported services:
- Travis CI
- Gemnasium
- Code Climate
- RubyGems
- just submit a pull reques to add more

Transparent PNG 24 versions available:
- Travis CI
  - passing
  - failing
- Gemnasium
  - up-to-date
  - out-of-date
  - update!
  - unknown 

## Problem
An increasing number of GitHub repos sport badges for things like:
- [Travis CI](https://travis-ci.org/) build status: 

![travis badge](http://f.cl.ly/items/2H233M0I0T43313c3h0C/Screen%20Shot%202013-01-30%20at%202.45.30%20AM.png)

- [Gemnasium](https://gemnasium.com/) dependency checks: 

![gemnasium badge](http://f.cl.ly/items/2j1D2R0q2C3s1x2y3k09/Screen%20Shot%202013-01-30%20at%202.46.10%20AM.png)

- [Code Climate](http://codeclimate.com): 

![code climate badge](http://f.cl.ly/items/0H2O1A3q2b3j1D2i0M3j/Screen%20Shot%202013-01-30%20at%202.46.47%20AM.png)

- [RubyGems](http://rubygems.org) released gem version: 

![rubygems badge](http://f.cl.ly/items/443X21151h1V301s2s3a/Screen%20Shot%202013-01-30%20at%202.47.10%20AM.png)

As you can see from the zoomed 400% verisons of these badges above, nobody is (really) using the same badge file and at normal size, they're hardly legible.

## Solution
As you can see below, without increasing the footprint of these badges, I've tried to increase legibility and coherence, removing useless text to decrease the horizontal length in the (likely) scenario that more of these badge thingies crop up on READMEs all across the land.

![shields on white](https://raw.github.com/olivierlacan/shields/master/shields_white.png)

![shields on black](https://raw.github.com/olivierlacan/shields/master/shields_black.png)

You can find a Photoshop CS6 PSD file containing the simple vector shapes and non-destructive styles I applied to create these. 

## Font
The font used on these badges is the Apache licensed Open Sans Regular availabe from [Google Web Fonts](http://www.google.com/webfonts/specimen/Open+Sans).

## Contributions
Please submit a pull request if you'd like to use Shields badges for a project that isn't yet supported, I'll gladly add them to the repository.

## License
See the included file LICENSE.md.