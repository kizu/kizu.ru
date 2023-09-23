---
mastodon_post_id: ""
---

# The Shrinkwrap Problem: Possible Future Solutions

#Anchor_Positioning #Future_CSS #CSS_Round #Experiment #CSS

_There is one old, yet unsolved, CSS problem: shrinking containers to fit the content when it automatically wraps. While not intentional, anchor positioning allows us to come closer to solving it, at least for a few cases. In this article, I’ll demonstrate how we can use anchor positioning to neatly decorate wrapping text or elements in flex or grid contexts._

## The Problem

When different content wraps — be it text, floats, inline-blocks, flex, or grid, — if that wrapping is automatic (without hard breaks), the way CSS calculates the final width is limited. The element with wrapped items gets expanded to fill all the available space.

In [CSS2 specs](https://drafts.csswg.org/css2/), this behavior is called [“shrink-to-fit”](https://drafts.csswg.org/css2/#shrink-to-fit-float):

> shrink-to-fit width is: min(max(preferred minimum width, available width), preferred width)

Let me demonstrate the problem and the fix[^disclaimer-note] in the same example:

[^disclaimer-note]: Most of the examples in this article could be viewed live in Chrome Canary with the “Experimental Web Platform features” flag turned on. <!-- offset="-3.5" -->

{{<Partial class="require-anchor-name" src="examples/example1.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 12.5em;">}}
  Without a fix, when an element does not wrap, it has a proper width, going neatly around the content. But when the text inside does not fit onto one line and wraps, the element expands.

  The next two blocks come with a fix: even though the text in the second element wraps, the container visually goes tightly around the text inside.
{{</Partial>}}

We can see how the first pink element in the example above gets the “preferred width”, and the second pink element gets the “available width”. Green elements look like they get the “preferred width” in both cases.

[An issue about a similar case](https://github.com/w3c/csswg-drafts/issues/191) was opened in CSSWG GitHub all the way back in 2016. There are numerous places on the web where people ask[^stackoverflow] if there is any solution to this.

[^stackoverflow]: For example, see [these search results for “CSS shrinkwrap problem” on StackOverflow](https://duckduckgo.com/?q=css+shrinkwrap+problem+site%3Astackoverflow.com). <!-- span="3" offset="2" -->

So far, there have been none (besides using JavaScript or fixed breakpoints in media queries).

<section>

## The Inline Solution

One of the specs I can’t wait to become finalized[^finalized] is [Anchor Positioning](https://drafts.csswg.org/css-anchor-position-1/). I did write a lengthy article with some of my initial experiments using it: [“Future CSS: Anchor Positioning”](/anchor-positioning-experiments/).

[^finalized]: There was an [alternative proposal](https://fantasai.inkedblade.net/style/specs/css-anchor-exploration/) by Apple, which suggested a few improvements. Several of them did find their way into the specs, and the Chrome team started prototyping them. Hopefully, more things will be resolved soon! <!-- span="3" -->

After publishing this article, I did many other experiments and wanted to write another big article similar to the first one. However, what I present today deserves a separate article.

I’m talking about the fix that I used in the example above, which relies on how anchor positioning is applied to inline elements. Let me quote [the current specs](https://drafts.csswg.org/css-anchor-position-1/#ref-for-fragment):

> If the target anchor element is fragmented, the axis-aligned bounding rectangle of the fragments’ border boxes is used instead.

How does this help? First, we need to wrap our element’s content into an additional span. While the pink elements are regular `<p>`, the HTML for our fixed elements is this:

```HTML
<p class="fixed">
  <span>
    This would also wrap as it contains
    an overwhelmingly long word.
  </span>
</p>
```

<aside style="--sticky: 0; --span: 3">
{{<Partial class="aside require-anchor-name" src="examples/example1-sticky.html" screenshot="true" video="true" offset="0">}}
<dl class="example-legend">
  <dt class="outer">Outer dotted outline</dt>
  <dd>Maximum width of the paragraph</dd>
  <dt class="inner">Inner dashed outline</dt>
  <dd>Span’s fragments</dd>
  <dt class="middle">Middle solid outline</dt>
  <dd>Anchored element around the fragments</dd>
</ul>
{{</Partial>}}
</aside>

And the CSS that is responsible for our visuals is this:

```CSS
@supports (anchor-name: --foo) { /* 1 */
  .example1 p.fixed {
    position: relative; /* 2 */
    isolation: isolate; /* 3 */
    background: none;   /* 4 */

    & > span {
      anchor-name: --span; /* 5 */
    }

    &::after {
      content: "";
      position: absolute;
      z-index: -1; /* 3 */

      anchor-default: --span; /* 5 */
      inset:
        0 /* 6 */
        calc(anchor(auto-same) - 1em); /* 7 */

      background: var(--GREEN); /* 4 */
      border-radius: inherit;
    }
  }
}
```

There are a few things to explain:

1. Because we would have to override the element’s background, we need to use progressive enhancement and wrap our styles in a `@supports`, allowing anything that won’t support anchor positioning to get the original styles.
2. By using the `position: relative` we have established a containing block, scoping the `anchor-name` inside.
3. Because we would be using our pseudo-element as the background, we need to establish the stacking context. `isolation: isolate` in this case is just a fancy `z-index: 0`, allowing us to use our pseudo-element in the background via `z-index: -1`.
4. We remove the background from our element and then apply it to our pseudo-element.
5. We add an `anchor-name` to the span, making it our anchor, and then use this name for the anchored pseudo-element’s position.
6. We set the block part of the `inset` property to use the regular positioning: after all, the only axis where we have a problem is the inline one. In the block direction, the wrapper will properly fit around its content.
7. We set the inline `inset` properties using the `anchor()` and a calculation.

</section>

### The Limitations

If you’re attentive, you could’ve noticed one issue. We “fake” the shrinking: the actual layout of the element does not change, as we are applying a purely visual effect by using the metrics of our line fragments, not changing the dimensions of any elements.

When we were aligning things to the right in the first example, we had to align the text to the right at the same time. But what if we’d want to have non-matching alignments, like with an element being on the right, but with the text inside being left-aligned?

The below example demonstrates the issue:

{{<Partial class="require-anchor-name" src="examples/example-limitations.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 12.5em;">}}
The example shows the issue with the text-alignment and a non-matching block alignment.
{{</Partial>}}

We can see how, because of our parent element taking all the available space, we can work strictly in its limits, with things looking good only when we have both alignment and text-align with the same values.

Regardless, I can find plenty of cases where this technique would be tremendously useful: decorations around headers (especially with `text-wrap: balance[^text-wrap-style]`), tooltips, and any other elements where it is ok for them to not interact with the surrounding elements at an inline axis.

[^text-wrap-style]: In [the more recent specs](https://www.w3.org/blog/CSS/2023/10/20/css-text-level-4-draft-updated/) there was a naming change for this effect, now it is `text-wrap-style`, but for now only `text-wrap` was implemented in browsers. <!-- span="3" offset="2" -->

Worth noting that I’m currently working on another article, which could be applied to solve _some_ limitations. Stay tuned!

## Fixing Flex-Like Layouts

As I mentioned in the beginning, the “shrinkwrap” problem exists not only for the normal flow, with the inline elements. It can be prominent in grids and flex layouts: whenever we have wrapping items or wrapping content over a main axis, be it because of `flex-wrap: wrap` or via `auto-fit` & `auto-fill` for repeating grids when these items would wrap, their container would get the maximum available width. We could not solve this in a way similar to the inline elements — unlike them, for grids and flex, we won’t have the automatically created fragments that we could use to target the items inside as a group.

However, in a few cases, we would have other methods in our toolbox to solve this.

### Wrapping Flex Items

In the below example, we have a flex context with elements of different widths, resulting in the container expanding to fill the available space. We can, in a limited fashion, decorate it to look like having a fitted container around the items:

{{<Partial class="require-anchor-name" src="examples/example2.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 10em;">}}
  There are five items with different widths that go over several lines, resizing the example shows how they have a background neatly wrapping around them.
{{</Partial>}}

The technique I’m using here is far from being optimal[^not-optimal] or easy to use. Why? We have to assign a unique anchor name for every item, and then calculate the position, checking the values of _every_ element:

[^not-optimal]: Initially, I did try to apply my [edge detection technique](/position-driven-styles/#edge-detection) from my [“Position-Driven Styles”](/position-driven-styles/) article for this, and for _some_ cases it might work, but I couldn’t create a universal solution. The issue: while we can detect the elements on the edges, we cannot detect the ones that are _closer_ to the edge. With the elements of unknown widths, they could be as far away from the edges as half of the widest element, and if we had shorter elements, we could end up selecting incorrect elements for our anchors. <!-- span="4" -->

```CSS
  inset-inline:
    min(
      anchor(--a auto-same),
      anchor(--b auto-same),
      anchor(--c auto-same),
      anchor(--d auto-same),
      anchor(--e auto-same)
    );
```

For the above example, we have to repeat it five times, which can make maintaining this cumbersome. But it works! What we do here is test every item and get the one that is the closest to the edge. At least, we can rely on the anchor positioning’s `auto-same` (to be replaced with the `same` in the future), defining the value once for both sides. We could even define it as the `inset` shorthand, but I prefer to use an `inset-block: 0` here, and not do the useless comparisons, as the size in the block dimension is something we _can_ calculate.

### Return of the Inline-Blocks

Having to define a unique ident for every list item can be limiting. For the flex context, the only wrapper available for us is the flex container, which would expand to fill the available space.

But what if we’d go back, to the times when we used to make flex-like layouts using floats and inline-blocks? Given how our core technique involves inline elements, I thought: “Let’s convert our wrapping flex items to our good old inline-blocks, and then wrap all of them with an inline span, which could be that group we could use to decorate everything!”.

It works!

{{<Partial class="require-anchor-name" src="examples/example2-ib.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 10em;">}}
  There are eight items with different widths that go over several lines, resizing the example shows how they have a background neatly wrapping around them.
{{</Partial>}}

Now, we don’t have to think about the uniqueness of our elements, though by losing the flex layout we lose _a lot_ of the convenience that came with the `gap` property. Oh, the mess we had to work with to make it look good when handling floats and inline-blocks!

In our case, the HTML is, uh, unconventional:

```HTML
<div class="wrapper">
  <ul role="list"
    ><li role="listitem">An item</li
    ><li role="listitem">Second item</li
    ><li role="listitem">Third item</li
    ><li role="listitem">Fourth item</li
    ><li role="listitem">Fifth item</li
    ><li role="listitem">Sixth item</li
    ><li role="listitem">Seventh item</li
    ><li role="listitem">Eighth item</li
  ></ul>
</div>
```

The main thing to note here is that, yes, I’m wrapping the elements _weirdly_. I know this might be controversial, but I always considered this way of removing the HTML whitespace to be the proper way of handling inline-block layouts, compared to hacking around it with the `font-size: 0`.

Then, I had to use an additional wrapper around our list, as the `ul` itself got `display: inline`:

```CSS
.example2-ib ul {
  display: inline;
  anchor-name: --wrapper;
}
```

I won’t show the code that makes the “gaps” work — as I did mention, it’s not as neat as the native `gap`.

I like that we can use the older techniques in combination with the new toys to achieve something unusual.

### Faking a More Complex Layout

Occasionally, we could want to place something on one side of these wrapping elements. For example, if we have a navigation in our header with this effect, we could want to have other non-wrapping elements alongside it.

While we cannot rely on the proper layout for this — our element would take more space in it than it would look like, — we could “fake” our layout. Again, with anchor positioning.

{{<Partial class="require-anchor-name" src="examples/example-fake-layout.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 16em;">}}
  The left side of this example is the same as in the previous example, the right side is an element that takes the rest of the space.
{{</Partial>}}

We can see how we’re limited again by the elements’ alignment. All because we rely on the position of elements in their container, which gets the whole available width.

The CSS I added to this example is as follows:

```CSS
.fake-layout ul::after {
  anchor-name: --list;
}

.fake-layout .fill-available {
  position: absolute;
  inset: 0;
  inset-inline-start: anchor(--list end);
  margin-left: 1rem;
}
```

We added an anchor name to the pseudo-element that works as our “background”, and then positioned our additional content on the left edge, starting from where this pseudo-element ends.

Note that our secondary column could not get higher than the content in the left one, as our element does not participate in the layout — it is positioned absolutely, and the only thing it knows is our decorative list wrapper.

### Grids with Fixed Column Width

When I mentioned grids, the only case that we could solve is the one when we have all columns with an equal width. And — we have to implement this grid via `display: flex`.

The reason: we cannot make a grid work with `max-width: max-content` for the single line case, due to the way `repeat()` with `auto-fill` or `auto-fit` contributes to the container’s intrinsic size. On the other hand, we could use this method sooner than the one using anchor positioning!

{{<Partial class="require-round" src="examples/example3.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 10em;">}}
  There are eight items that have the same width going over several lines, resizing the example shows how they have a background neatly wrapping around them.
{{</Partial>}}

The solution here is the [`round()`](https://drafts.csswg.org/css-values/#funcdef-round) function!

```CSS
  box-sizing: content-box; /* 1 */
  max-width: max-content;  /* 2 */
  width: calc(
    round(down, /* 3 */
      100% /* 4 */
      +
      var(--gap) /* 5 */
      -
      2 * var(--padding) /* 6 */
      ,
      var(--column-width)
      +
      var(--gap) /* 5 */
    )
    -
    var(--gap) /* 5 */
  );
```

For the final calculation, we need a bunch of moving parts:

1. First thing: to simplify things, we have to use `box-sizing: content-box`. Because we explicitly set the `width`, we need to know how we size the box, so we either would add the paddings inside or not.
2. To handle the single-line case, we use `max-width: max-content` to limit how wide our container could get.
3. The important part: using `round()` with the `down` keyword to, well, round things down.
4. Notable thing: we’re using container query length units here, and have to set up a container around our wrapper, as otherwise `100%` won’t work in Safari, at least for now.
5. The basic calculation is: we want to calculate how many times our elements would fit into our box, and include the gap in the calculation. Because the number of gaps is one fewer than the number of items, we would like to round things by the sum of the column width and gap, and then subtract one gap at the end.
6. Curiously, even if we would use `100%`, in the context of `round()` it will use the border-box of our element for `100%` regardless of `border-box`, making us manually subtract the paddings inside the `round()` (and we’d need to subtract the borders if we’d have them).

### More Complex Layout with `Round()`

Because in the above example, we're not using anchor positioning and are calculating the width via `round()`, we can use a similar calculation to have a proper layout:

{{<Partial class="require-round" src="examples/example-not-as-fake.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 16em;">}}
  The left side of this example is the same as in the previous example, the right side is an element that takes the rest of the space.
{{</Partial>}}

Here we use a grid, and while the grid itself stays the same, we can use a negative margin for the element in the second column to move it the same amount to which we reduced the wrapping container:

```CSS
.complex-layout .fill-available {
  margin-left: calc(
    round(down,
      var(--ratio) * 100%
      +
      var(--gap)
      -
      2 * var(--padding)
      ,
      var(--column-width)
      +
      var(--gap)
    )
    +
    var(--gap)
    -
    var(--ratio) * 100%
  );
}
```

We’re using the same calculation[^mod-rem], with a notable difference in using the `--ratio` variable to adjust the percentage width: in our case, we’re using `2fr 1fr` for the columns, so the `--ratio` would be equal to `2`.

[^mod-rem]: We could also try using the `mod()` or `rem()` here, but I like using the same `round ()` for consistency.

The main limitation of this example is that when there are fewer elements that fit into the left column, the column won’t shrink, as we’re sizing the columns without relying on the content.

## The Basic Setup with the Fallback

One issue with anchor positioning for inline elements is that it might be tricky to get the graceful degradation _right_. Because we’re faking the way the background works by separating it into separate elements, things might get weird[^weird].

[^weird]: I consciously kept many of the above examples without proper fallbacks, as a way to demonstrate the issue — if you’re viewing this article in a browser that does not support anchor positioning, try toggling the videos off to see how things will look without the fallbacks. <!-- offset="3" span="3" -->

The best approach I found for handling this is to define our styles as progressive enhancement. How would you want the element to look when anchor positioning is not applied? Style the element this way, then add the `@supports` and modify things to use anchor-positioning later.

One convenient thing to do is to make our anchor target the positioning context, allowing us to continue using the extra element as the background. Then, instead of using additional anchors, it would rely on the target itself for regular positioning. The final “basic” styles I would be using for the later examples are similar to this:

```CSS
.shrinkwrap {
  position: relative; /* 1 */
  isolation: isolate; /* 1 */
}

.shrinkwrap-target {
  position: relative;    /* 2 */
  display: inline-block; /* 2 */
  anchor-name: --target; /* 3 */
}

.shrinkwrap-target::before { /* 2 */
  content: "";
  position: absolute;
  z-index: -1;              /* 1 */
  anchor-default: --target; /* 3 */
  inset: 0; /* 4 */
  inset-inline: anchor(auto-same); /* 5 */
}

@supports (anchor-name: --foo) {
  .shrinkwrap-target {
    position: static; /* 2 */
    display: inline;  /* 2 */
  }
}
```

A few notes:

1. We’re using the parent node as our root positioning context, scoping our nested anchor-names, and providing an isolation for any `z-index` we’re using (like for putting our element into the “background” via `z-index: -1`).

    The root positioning context can also be useful for using the non-anchored coordinates when using anchor positioning, as we cannot apply `position: relative` to our target without losing an ability to anchor things to it — a quick that, I hope, will get changed (I’ll put a link to an issue about this here later).

2. Without anchor positioning, the context for our background element would be the target, so we’d make it an inline-block, and add `position: relative`. However, we’d want to reset both of these to `static` and `inline` when we use anchor positioning.

3. It is not necessary to put properties that are used for anchor positioning like `anchor-name` and `anchor-default` inside the `@supports`, as they would be ignored when not supported.

4. We’d want to have a fallback for our `inset` property when the `anchor()` is not supported.

    **Important note: ** If there will be a `var()` inside the `inset` for anchor positioning, we would have to move the whole declaration inside a `@supports`, as using the CSS variables would make browsers think that the declaration is “supported” and the fallback mechanism won’t work.

5. Currently, the keyword inside is `auto-same`; however, it is likely it will be renamed to `same` in the future.

## Use Cases

I can think of many use cases for all the above, I will provide a few that I did remember from the top of my head, and I will leave the rest for you to experiment on.

### Chat Bubbles

The initial demos in this article did already look like them, but to re-iterate in a more obvious way: bubbles in various message apps can sometimes have this style. I remember doing a custom CSS theme for Adium, and stumbling upon the shrinkwrap issue, where I wanted the messages to be short and wrap the content. Now I know how to do it! Or — will know what to do in the future when anchor positioning will be available everywhere. But not in the past.

{{<Partial class="require-anchor-name" src="examples/example-bubbles.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 10em;">}}
  There are several text bubbles in this example, some are aligned to the left, and some — to the right. Text inside of them can wrap, but the bubbles won’t wrap around them neatly without the shrinkwrap fix.
{{</Partial>}}

### Legends and Headings

Oh hey, this is a callback to [my old post here](/legends-and-headings/) with the same name!

#### Legends

The idea of that older experiment was to have a `<legend>` inside a `<fieldset>` or a heading that would have lines around it. In the case of a legend, we could “emulate” the position of it in the center of its fieldset, which is not possible with regular means.

{{<Partial class="require-anchor-name" src="examples/example-legend.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 10em;">}}
  There are two fieldset elements with centered legends. The border goes to the sides of the text inside the legends, even though one of them wraps. Disabling the shrinkwrap fix shows how the borders would not go close to the text when it wraps.
{{</Partial>}}

#### Headings

Both fieldsets and headings did use inline-blocks to emulate the borders that go from the edges of text, and for wrapping text I had to add a `<br />` to avoid the shrinkwrap problem. This time, it is absolute positioning, though for some time I thought that if I had to implement this method once more, I’d do it via flex or grid — but with them, we couldn’t solve the “shrinkwrap”.

{{<Partial class="require-anchor-name" src="examples/example-headings.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 10em;">}}
  There are two headers with the borders going from their sides to the edges of the sections they’re in. One of the headers wraps, and if we disable the shrinkwrap fix, the borders for this wrapping header disappear.
{{</Partial>}}


### Even More Heading Decorations

These are simple-looking — I’m not a designer — but I hope they will demonstrate the ideas that we can implement with this technique.

{{<Partial class="require-anchor-name" src="examples/example-headings-fleurons.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 10em;">}}
  Headers that have [fleurons](https://en.wikipedia.org/wiki/Fleuron_(typography)) on the sides. When the header wraps, the fleurons are centered vertically and are close to the text.
{{</Partial>}}

{{<Partial class="require-anchor-name" src="examples/example-headings-underline.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 10em;">}}
  Headers that have a single underline beneath. Without the fix, the underline would go from the edge to the edge of the container, while with the fix, it goes only to the width of the widest line.
{{</Partial>}}

There might be many other ways we could style the headers, I feel like I only scratched the surface with these simple examples. If you’re a designer and have an idea for some header style that you might think could be achieved with this technique — throw it at me!

### Other Use Cases (Without Examples)

I could continue creating demos, but at this point, the article is long enough! Instead, if you’re curious, I recommend trying this method yourself and implementing these as an experiment (not in production, of course).

- Notification boxes — sometimes we’d want to show a notification box (also known as “toast”), which would have a border up to its content. With multiline content, things might not look good!
- Image captions — elements like copyright information, captions, and similar — can be sometimes seen in a corner of an image with a semi-opaque background. Again, right now, these have to contain hard breaks, but with this method, we could allow doing line breaks automatically.
- Blockquotes — when these have “big” quotation marks around them. A similar case to the headers with fleurons.
- Tooltips — these could contain multiple lines of text, and we’d want to limit their width, but then neatly wrap around the content, and without any dead space of the underlying background.
- Wrapping menu alongside a search — an example close to the “faking a more complex layout” case, where the menu could wrap, but the search field alongside it would like to take the rest of the space.

## The Future

I’m not sure if we will ever get a proper way to handle this. Certain cases could be simplified, and potentially several of them could be solved in a manner similar to the `text-wrap: balance`, where we could limit the number of lines covered by the algorithm, simplifying things without a big impact on performance.

For now, a place to monitor would be the CSSWG [“How to shrink to fit the width?”](https://github.com/w3c/csswg-drafts/issues/191) issue. If you have any other use cases that involve the “shrinkwrap” — provide them in this issue!
