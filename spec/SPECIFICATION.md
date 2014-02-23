This document specifies the visual design of Shields badges.

# Specification

## Guidelines
- **legible**: it should be as easy to read the metadata provided by a badge as it is to read body copy inside of a README file regardless of display resolution
- **semantic**: the purpose information provided by a badge should be self-evident
- **non-promotional**: badges should not advertise but instead provide value through information
- **concise**: one descriptive word on the left (the key), one piece of data on the right (the value)
- **hyperlinked**: badges can link to a third-party website providing more information, either related to the metadata provided by the badge or about the project the badge was used for (e.g. an open source library) 

## Aesthetics
The design of our badges has been carefully considered to provide sufficient padding between the container badge and the text within. Badges should never have a fixed width. The letter spacing (or kerning) is deliberate and focused on clarity, so is the use of the Open Sans font face. Contrary to widely available web-safe alternative sans-serif fonts like Arial (a sloppy Helvetica ripoff) and Verdana (a sloppy Futura ripoff), OpenSans remains highly legible at very small sizes which is why it was chosen.

![](https://raw.github.com/badges/shields/master/spec/proportions.png)

When it comes to color choices, the focus is on clear contrast between the text and the background color on both sides of the badge (key and value). The two sides are also contrasted with each other with the key side always retaining a dark grey color for consistency, and the value side taking on whichever background color better conveys the meaning of the data provided (e.g. green for a successful build, red for a failed build).

