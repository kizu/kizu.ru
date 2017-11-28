# Flexible Overflow

![Gif animation showing this article's effect in action](sad-lions.gif)

A lot of people love responsive sites, and we used to make them with the help of Media Queries. Today, in the era of components, we can't rely just on the width of our viewport anymore. Our components need to be independent and work in any conditions.

One of the solutions everyone is waiting for is [Container Queries](https://github.com/w3c/csswg-drafts/issues/1031) (formerly known as Element Queries). But their future is not certain, and while there are [polyfills](https://github.com/marcj/css-element-queries) that allow us to use some of their possible features, the need to polyfill everything can be daunting.

But should we rely on JS or look at our news feeds in anticipation of Container Queries all the time? What if CSS is already powerful enough to solve some of the potential Container Queries use cases right now? What if CSS could even solve some of the responsive cases that even Container Queries probably [couldn't solve](*queryless "Very often we don't know the dimensions we could rely on, even on per-component basis, so _queries_ not always could help us, and we need to learn how to use more complex CSS to achieve what we want.")?

Today I'll present you with one of those cases.

## Long Line of Text Becomes Shorter

Whenever we have a very long string that won't fit our available space, the most obvious solution is `text-overflow: ellipsis`. But very often we don't want to just truncate our long text strings: we could want to substitute it with some other text instead, remove some parts, or replace it with just an icon. That's what you could see happening in the gif at the start of this article, and here is a much simpler live example (try to resize the wrapper or toggle the toggler to see how it would behave):

[partial:1]

The code beyond this example is just some HTML & CSS which [uses](*fallback "With fallback to just `text-overflow: ellipsis` when there is no support for `flex-wrap`.") flexbox, and is made to be accessible to screen-readers which would read only the longest part, ignoring the shorter one. Ah, and also whenever you see the shorter line, the longer part would be also accessible as an HTML title.

## The Implementation

I'll go straight to the code and would explain some parts of it later. Here is the CSS I've written for the above example:

    .overflower {
      display: inline-block;
      overflow: hidden;

      box-sizing: border-box;
      max-width: 100%;
      height: 1.5em;
      line-height: 1.5em;

      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .overflower-long {
      display: inline;
    }

    .overflower-short {
      display: none;
    }

    @supports (flex-wrap: wrap) {
      .overflower {
        display: inline-flex;
        flex-wrap: wrap;
      }

      .overflower-short {
        display: block;
        overflow: hidden;

        flex-grow: 1;
        width: 0;

        text-overflow: ellipsis;
      }

      .overflower-long {
        flex-basis: 100%;
      }
    }
    {:.language-css}

Here is how the markup looks for it:

    <span class="overflower">
      <span
        class="overflower-short"
        aria-hidden="true"
        title="Some long text that could become shorter"
      >
        Short text here is.
      </span>
      <span class="overflower-long">
        Some long text that could become shorter.
      </span>
    </span>
    {:.language-html}

The best part here is that you can nest this construction, thus gaining more than two possible length variations:

[partial:2]

And two more examples: header and a menu, as the more common use cases for something like this:

[partial:header]

[partial:menu]

### Flex

So, how and why does this work? Let's look at CSS:

1. The first thing you can notice is that most of the styles are beyond the [`@supports`](*ie11 "We miss IE11 here, and maybe with some hacks, we could make it work as well, but I don't think it would worth the effort. You can try though if you want."): that is because everything works only when we can have `flex-wrap`, so we would need to have some fallback in case there won't be any (UC Browser for Android, hello).
2. The next thing is that we need to make the height of our block fixed (and [equal to line-height](*lh-unit "That would be an ideal case for [the lh unit](https://drafts.csswg.org/css-values/#lh), can we have it already, please?") for simplicity), so we could trim everything that would be wrapped later (rather a common trick I'd say).
3. Now, the most interesting part: we need to make the shorter part to disappear when there is enough space for our long part, but then to appear when there won't be. We do this by making the short part to take all the remaining space of the flex flow and then making the long part to take all 100%.

    When there is enough space for the long part it would always take this space. But when its parent would become shorter than the contents of the long part, the magic part would happen: it would jump to the new line as there was another item before it, and that shorter item, that had basically 0 width before, would _grow_ to take all the suddenly vacant space.
    
In the end, the CSS for this effect is rather short. We just utilize multiple aspects of flexbox together: wrapping, growing and shrinking.

### Accessibility

While there are some minor caveats that are hard to overcome (when the shorter variant is shown, you could select & copy it alongside the longer [variant](*overflower-text "It is possible to work around that by not having the shorter variants as HTML content, but inserting it as pseudo-elements by using attributes, see the example with Header above.")), most of the a11y stuff is fixable in HTML:

- For screen readers we need only the longest part, so we can hide everything else using `aria-hidden='true'`.
- We can enhance the experience for users who can use a pointer device and can see the `title` attribute's tooltip by adding it for the short part only. This way, when the text would be displayed at full, we won't have this tooltip. And when at least something is hidden we'd get the tooltip on hover.
- If we would use this method by nesting it, we'd need just one `aria-hidden` and `title`, both on the topmost short variant.
- As the crucial part of this method is based on `flex-wrap`, for those who don't support it we make a fallback to just `text-overflow: ellipsis`, so things won't break in older browsers.

## Play With Flex, CSS & Everything

This was just one of the possible effects you can achieve using powerful modern CSS. And as flexbox is already really wide supported, and fallbacks for it are easy, nothing should stop you from using it. I'll continue my experiments with flexbox, and later with grids, so stay tuned for more responsive, queryless solutions from me. Ah, and there is also some space for good old floats, they're still cool and can sometimes achieve stuff that is really hard to do otherwise.

Things were interesting in CSS, they are now, and they'll always be.
