# My Grid Layout

#CSS_Grids #Practical #CSS #Design

_My site’s design came through a lot of iterations, including the latest complete rewrite and a partial redesign, but its layout is something I used for a while. In this article, I’ll describe what I tried to achieve with it and how it was re-implemented using CSS Grids._

## Centered Content

One of the main things I believe about the design of web pages — they should be readable. There are a lot of things to talk about on the micro level — typography, contrast etc. — but in this article, I’ll talk about the macro level — the page’s layout. Or, more precisely — my site’s page layout.

I came with its design after a lot of iterations, and one of the things that I have always tried to do in order to increase my site’s readability is to limit the content’s width and center it inside the viewport, and in its basic form, it is maybe the easiest thing to do.

<figure class="Aside Wireframe MyGrid">
  <div class="MyGrid-Content Wireframe-Text"></div>
</figure>

This is probably one of the most common types of layout on the web today; in the older days I remember some of the web designers tried not to center things, forcing them to stick to one of the screen’s edges, but over time the more obvious solution — centering it — basically became the standard.

### Something Aside

But one thing that I have always noticed about those layouts: whenever you’ve added a single column on the left or on the right, the content stopped being centered, shifting the content to the side, making it slightly more awkward to look at and read.

I always noticed that such columns were not centered, and it distracted me a bit, so I tried to find the best way to achieve the centering even when we added an extra column, and to do so without hacks involving an invisible extra column or hard-fixed value, and also in a way it would adapt properly to smaller viewports as well.

<figure class="Aside Wireframe MyGrid">
  <div class="MyGrid-Content Wireframe-Text"></div>
  <div class="MyGrid-Aside Wireframe-Text" style="height: 26em; --line-offset: -4; --header: 0; margin-top: 6em;"></div>
</figure>

Most of the similar layouts I saw in the wild could’ve looked close to the one I wanted, but when I looked at how those layouts adapted to different smaller viewports, I almost always noticed that they either got some extra lost space (due to a lot of invisible space that was there for centering purposes), or those layouts switched to a one-column “mobile” layout as soon as the design couldn’t fit into the viewport (too soon).

This was far from what I wanted to achieve, as I wanted this centering behaviour to be complementary and not the foundational — in most cases it is better to have all the content to fill the available space while having the most optimal line lengths inside, and I think I’ve managed to achieve this with my layout.

<figure class="Aside Wireframe MyGrid" style="width: 64em;">
  <div class="MyGrid-Content Wireframe-Text"></div>
  <div class="MyGrid-Aside Wireframe-Text" style="height: 26em; --line-offset: -4; --header: 0; margin-top: 6em;"></div>
</figure>

When I first implemented this layout for my site, I have used some floats, margins and nested blocks, and it kinda worked. But for the [new version of my site]({{% LinkTo v-14-0 %}}), I have decided to do everything with CSS Grids and looked into how to achieve this layout with them.

## The Implementation

While you can look into my site’s source to see how it is done, there is a lot of other experimental stuff going on, potentially preventing you from accessing the layout code right away, so if you don’t want to dig through the source, I’ll provide you with a simplified version of my site’s layout, and then I would explain how it works (and this exact code is used for the layout of those small layout examples in this article, btw).

A couple of notes before I’ll go into details explaining what’s going on there:

- In this article, I won’t cover what happens at my site when the width becomes too narrow to have both columns, but I basically switch the layout to a one-column one via CSS variables. Both CSS Grids and CSS variables make this switch very easy, highly recommend (and you can always have the narrow one-column variant to be the default, for those browsers that do not support CSS Grids). I hope to write one of the next articles about that too, but in the meantime, I urge you to read this [awesome article about state-switching with CSS Variables](https://css-tricks.com/dry-state-switching-with-css-variables-fallbacks-and-invalid-values/) by [Ana Tudor](@anatudor).

- I extensively use [CSS variables](https://www.w3.org/TR/css-variables-1/) alongside [CSS grids](https://www.w3.org/TR/css-grid-1/). You should do the same — [the browser support for variables](https://caniuse.com/#feat=css-variables) is almost the same as [the support for grids](https://caniuse.com/#feat=css-grid), so any browser that supports grids (in their modern form, I don’t count the older IE variants there) would support variables as well, so you don’t need to limit yourself in experimenting with grids only — if you’re already playing with them, try to add variables as well!

Actually, you can notice that there is not a lot of code for my layout, eh? That’s CSS grids for you!

``` CSS
.MyGrid {
  display: grid;
  grid: " .            content        aside      "
        / var(--side)  var(--middle)  var(--side);
  grid-gap: 0 var(--gap);

  --middle: minmax(24rem, 42rem);
  --side: minmax(min-content, 1fr);
  --gap: 2rem;
}

.MyGrid-Content {
  grid-column: content;
}

.MyGrid-Aside {
  grid-column: aside;
  width: 15rem;
  margin-right: var(--gap);
}
```

## The Explanation

So, how it works? The basics are: we’re creating a grid layout with three columns, but then actually use only two. If you’d look into the `grid-template-areas` part — [that ASCII-like string](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas):

``` CSS
" .            content        aside      "
```

You could notice a few things:

1. We do not set “columns”, but “areas”, and that’s ok: we can use only one axis which we would get from this and forget about the rows at all. I even wrote a whole article about this method: [Grid Projection Naming]({{% LinkTo grid-projection-naming %}}).

2. We use a lot of spaces: we can use them to visually align our column names with their widths below inside a shorthand:

    ``` CSS
    grid: " .            content        aside      "
          / var(--side)  var(--middle)  var(--side);
    ```

3. We don’t use the first column at all, so we can omit its name and just use a [special dot symbol instead](https://www.w3.org/TR/css-grid-1/#grid-template-areas-null-cell-token):

    > A sequence of one or more “.” (U+002E FULL STOP), representing a null cell token.

    This can be quite useful for bigger grids and is totally safe to do.

### Minmax, min-content, fr

Now, you can see that we use variables for the widths of our columns:

``` CSS
--middle: minmax(24rem, 42rem);
--side: minmax(min-content, 1fr);
```

We’re using a [`minmax`](https://developer.mozilla.org/en-US/docs/Web/CSS/minmax) property, as well as an [`fr` unit](https://www.w3.org/TR/css-grid-1/#fr-unit) and a [`min-content`](https://drafts.csswg.org/css-sizing-3/#valdef-width-min-content) intrinsic value.

Our **middle column** is rather obvious: we don’t want it to be too narrow or too wide, and the values there are those that I found the best for the font I use.

Our **side columns**, though, are a bit more complex: the `1fr` for their “max” argument means that they would try to expand to take all the extra space not taken by the central column, and `min-content` would mean that if there would be any actual content placed inside a column, this column’s width couldn’t be reduced to be lower than this content’s min-width.

And this `minmax` for side columns is the mechanism behind the behaviour I wanted to have for my layout: when there is enough free space the columns would be equal, making the central column to be centered, and when there won’t be enough space both columns would shrink until they would be reduced to the width of the content inside the right one, and after that, the right column’s width would stay the same, while the width of the empty left one would shrink.

### The Downsides

This method is not perfect:

1. As mentioned above, the right column should have a fixed width (or a min-width) in order for the layout to work properly, and the problem is that this min-width should be set over on the grid item level and not on the grid itself.

2. We should be extra careful with horizontal gaps: for my layout I use the left gap as the whole page’s left padding, but I can’t do the same on the right side, as then either everything would go off-center, or the padding on the left would be too big, so I had to use an extra margin over at the content inside the right column.

I think both of these things could be potentially fixed in the future of the CSS Grid Layout and I’m planning to gather all such issues I stumbled while experimenting on it and combine them into my wishlist for CSS Grids which I plan to publish in the future.

## Everything Else

The fact that I’m using CSS grids for my layout allows me to do a lot of interesting things, but this article is already too big, so I’ll stop right there and would try to write about everything else later in separate articles.

As a spoiler-teaser, things I’d like to write about in the context of my site’s layout:

- How I implemented the sidenotes.
- How I used CSS grids for header and footer’s microlayouts.
- How I used inline CSS variables to configure some parts of my layout.
- About some of the use cases for the CSS subgrids, and the absence of which I had to work around.
- About how I used CSS variables to make the layout responsive.
- How I made a fallback for browsers that do not support grids.

This is not an extensive list and I would probably write about some other topics as well. In the meantime — feel free to inspect the source for my site, maybe you’ll find some interesting things inside!

## Conclusion

CSS Grids are cool. They can be a bit hard to get into (as they come with a lot of new stuff — all the `minmax`, all the sub-properties), but when you’ll understand how they work, a lot of things become very easy to achieve.

Go and experiment with CSS grids! And try to do so while using CSS variables and other modern features of CSS — they all play together and complement each other. Good luck!
