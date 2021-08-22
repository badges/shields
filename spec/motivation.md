## Solving the problem

Many GitHub repositories sport badges for things like:

<table>
  <tr>
    <td><a href="https://travis-ci.org/"><strong>Travis CI</strong></a><p><sup>(build status)</sup></p></td>
    <td><img src="http://f.cl.ly/items/2H233M0I0T43313c3h0C/Screen%20Shot%202013-01-30%20at%202.45.30%20AM.png" alt="Travis CI badge"></td>
  </tr>
  <tr>
    <td><a href="https://gemnasium.com/"><strong>Gemnasium</strong></a><p><sup>(dependency checks)</sup></p></td>
    <td><img src="http://f.cl.ly/items/2j1D2R0q2C3s1x2y3k09/Screen%20Shot%202013-01-30%20at%202.46.10%20AM.png" alt="Gemnasium badge"></td>
  </tr>
  <tr>
    <td><a href="http://codeclimate.com"><strong>Code Climate</strong></a><p><sup>(static analysis)</sup></p></td>
    <td><img src="http://f.cl.ly/items/0H2O1A3q2b3j1D2i0M3j/Screen%20Shot%202013-01-30%20at%202.46.47%20AM.png" alt="Code Climate badge"></td>
  </tr>
  <tr>
    <td><a href="http://rubygems.org"><strong>RubyGems</strong></a><p><sup>(released gem version)</sup></p></td>
    <td><img src="http://f.cl.ly/items/443X21151h1V301s2s3a/Screen%20Shot%202013-01-30%20at%202.47.10%20AM.png" alt="RubyGems badge"></td>
  </tr>
</table>

As you can see from the zoomed 400% versions of these badges above, nobody is (really) using the same badge file and at normal size, they're hardly legible. Worst of all, they're completely inconsistent. The information provided isn't of the same kind on each badge. The context is blurry, which doesn't make for a straightforward understanding of how these badges are relevant to the project they're attached to and what information they provide.

## The Shields solution

As you can see below, without increasing the footprint of these badges, I've tried to increase legibility and coherence, removing useless text to decrease the horizontal length in the (likely) scenario that more of these badge thingies crop up on READMEs all across the land.

![Badge design](proportions.png)

This badge design corresponds to an old and now deprecated version which has since been replaced by beautiful and scalable SVG versions that can be found on [shields.io](https://shields.io)
