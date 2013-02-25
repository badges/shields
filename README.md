# Shields

A legible and elegant info-badge solution for codebase services, available. Soon to be Retina-ready.

![shields on white](https://raw.github.com/olivierlacan/shields/master/shields_white.png)

## Services using Shields
- [Code Climate](https://codeclimate.com/changelog/510d4fde56b102523a0004bf)
- [Coveralls](https://coveralls.io/r/kaize/nastachku)
- [Gemfury/RubyGems](http://badge.fury.io/)
- [Gemnasium](http://blog.tech-angels.com/post/43141047457/gemnasium-v3-aka-gemnasium)
- [Travis CI](http://about.travis-ci.org/docs/user/status-images/)

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

As you can see from the zoomed 400% versions of these badges above, nobody is (really) using the same badge file and at normal size, they're hardly legible.

## Solution
As you can see below, without increasing the footprint of these badges, I've tried to increase legibility and coherence, removing useless text to decrease the horizontal length in the (likely) scenario that more of these badge thingies crop up on READMEs all across the land.

![shields on white](https://raw.github.com/olivierlacan/shields/master/shields_white.png)

![shields on black](https://raw.github.com/olivierlacan/shields/master/shields_black.png)

You can find a Photoshop CS6 PSD file containing the simple vector shapes and non-destructive styles I applied to create these. 

Thanks to @ackerdev we also have SVG equivalents of all existing badges if you would like your badges to be Retina-ready or dynamically manipulate the text inside of them before you output them to PNG 24 Alpha (transparent background).

## Retina Ready
Since one of the major concerns is legibility, it's impossible to ignore how bad shields will look on retina (high DPI) displays.

A suggested by @kneath, Shields displayed with an HTML image tag (instead of the easier Markdown image tag) can be given a fixed height to force an image that is actually double the resolution into a 50% smaller image, which will display properly for both retina and non-retina screens.

Here's an example with the following code: 

```html
<img src="https://raw.github.com/olivierlacan/shields/master/shields_white@2x.png" height="143" alt="Retina-ready Shields example" />
```

<img src="https://raw.github.com/olivierlacan/shields/master/shields_white@2x.png" height="143" alt="Retina-ready Shields example" />

All shields aren't yet compatible with this but we're working on updating them soon. Look for image filenames with `@2x` suffixes, those will be the pixel doubled versions. 

Note: They were pixel doubled manually in Photoshop, not after the fact.

## Font
The font used on these badges is the Apache licensed Open Sans Regular available from [Google Web Fonts](http://www.google.com/webfonts/specimen/Open+Sans).

## How to resize a Shield

Want to use one of these swanky badges for your own service right now and don't have time to [open an issue](https://github.com/olivierlacan/shields/issues) and wait for us to help you out?

Well here's a hint, if you need to resize the badge yourself in Photoshop make sure you use the vector points [like this](http://link.olivierlacan.com/MmlK).

In Illustrator, it's [a little different](http://f.cl.ly/items/071J0Q2m0D38250g2s1F/shields_resize_illustrator.mov) (4.8 MB .mov video).

## Contributions
See [CONTRIBUTING.md](CONTRIBUTING.md).

## License
See [LICENSE.md](LICENSE.md).