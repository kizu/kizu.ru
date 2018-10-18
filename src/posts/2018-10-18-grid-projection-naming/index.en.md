# Grid Projection Naming

#CSS_Grids #Practical #CSS

_CSS Grids specification contains a lot of different things. And, for some of them, there exist multiple ways of how you can achieve them. In this article, I’ll write about one trick with `grid-template-areas` that could help you name your intersecting columns or rows._

For my new site[^new-site], I wanted to use CSS Grids[^grids], but I also wanted to keep the layout that I had come up with for my previous version. It wasn’t that intricate but had its own nuances which I still liked. Overall, grids allowed me to replicate that layout much easier than I thought it would be, even if there were one or two things that didn’t come out as good as I hoped.

{{<Sidenotes span="3">}}
  [^new-site]: If you have missed it — I’ve redesigned and rewrote the engine for my site, and [wrote an article]({{% LinkTo v-14-0%}}) about it. While doing this, I came up with a lot of stuff I want to write about — and this article is the first of those.

  [^grids]: If you’re just starting with grids, I recommend you to read [Jen Simmons](@jensimmons)’ and [Rachel Andrew](@rachelandrew)’s articles. You can start with the [“Quick way to try out grid”](http://jensimmons.com/post/aug-15-2017/heres-super-quick-way-try-out-css-grid) article by Jen, for example.
{{</Sidenotes>}}

In this article, I would tell you about one trick I came up for naming my layout’s grid columns. Everything else — how the layout works and what were the problems with it — I’ll save for another article, otherwise, this one would become too big.

## Named Intersecting Columns

When I started developing the layout, I wanted to place the content by using named grid columns, so everything would go into a `content` column by default, but sidenotes and similar stuff would go into an `aside` column. I also wanted to have a way to place something to the full width of the grid and also having a way to place something in the place of both[^three-columns] `content` and `aside` columns.

[^three-columns]: For my layout, there is a difference between `full` and `both`, as I have also a third column on the left for centering purposes (which I don’t use for anything yet, so nameless), but more on this in a later article. <!-- offset="5" span="2" -->

While reading the [CSS Grid Layout Module specs](https://www.w3.org/TR/css-grid-1/), I found out that you indeed can have intersecting columns (or rows), by using the [explicitly named grid lines](https://www.w3.org/TR/css-grid-1/#grid-line) with identifiers starting and ending in `-start` and `-end`. Basically, by using this method, I could create my columns layout by something like this:

``` CSS
main {
  grid-template-columns:
    [full-start]
      var(--grid-side)
      [both-start
        content-start]
          var(--grid-content)
        [content-end
        aside-start]
          var(--grid-side)
        [aside-end
      both-end
    full-end];
}
```

Then I could place my content with `grid-column: content`, place things into a right column with `grid-column: aside`, make something take the full width of the layout with `grid-column: full`, or take just the width of both content and aside columns with `grid-column: both`.

When I explain things like that, you could probably imagine how the layout would look like… Or maybe not? Even while I tried to place everything in the above code as neatly as possible by using indentation to show the nesting of the intersecting columns and so on, I’d say that it is still a bit confusing and too complicated. And, more importantly: it’s unmaintainable. Imagine: what if you’d need to add another named column that would take both the first unnamed column and the second content one? Or if we’d need to add a fourth column somewhere in-between? Or change and move stuff for a narrower layout inside a media query?

While this syntax is powerful, it is very cumbersome. So, I started to dig deeper. I knew that there is a way to mark up grids by using visual string templates[^ascii], but didn’t see how they could allow you to intersect multiple areas. It seemed to be impossible.

[^ascii]: Similar to [ASCII-art](https://en.wikipedia.org/wiki/ASCII_art), by using the [`grid-template-areas`](https://www.w3.org/TR/css-grid-1/#propdef-grid-template-areas). <!-- offset="2" -->

Until I looked at my layout and noticed that it is not a two-axis layout. I had only named columns, but everything else would be auto-placed, so all the rows are implicit. This leads me to this[^aligning-columns]:

[^aligning-columns]: After the slash you can see the widths for the columns. I’ve used indentation there to align the corresponding values with columns I have, so it is easier to understand which column would have which size. <!-- offset="2" span="2" -->

``` CSS
main {
  grid-template-areas:
    " full  full     full   "
    " .     both     both   "
    " .     content  aside  "
    / var(--grid-side)
            var(--grid-content)
                     var(--grid-side);
}
```

For my purposes, this creates the same exact grid layout. Can you see what the trick is?

## The Projection Trick

Whenever you’re marking up your grids by using the `grid-template-areas`, what happens is: you’re not just naming _areas_. In fact, you’re naming also columns and rows! And — the most interesting part — those rows and columns would get names from all the areas that are projected onto them. So, if we’d look[^and-hover] at our template, it could be represented as something like this:

[^and-hover]: All the examples in this article are live and interact with hover — you could use it to see more easily the projections. <!-- span="2" offset="4" -->

{{<Partial src="examples/projection.html" />}}

Here you can see where different items are placed[^placed] when given `grid-area`, `grid-column`, and `grid-row`.

[^placed]: `-column` and `-row` ones are placed at _negative grid lines_ to better demonstrate the idea. You can read about them in this [great article by Michelle Barker](https://css-irl.info/negative-grid-lines/). <!-- span="2" -->

- The `-area` items go right where you would expect them to — according to their placement in the template.
- The `-row`s ones show that the first row would be called `full`, the second one — `both`, and the third one would share `content` and `aside` names. Basically, all of this is useless, as we won’t ever use those for our layout, and those names have meaning only in our projection example.
- The `-column`s names are, actually, what we need: `full` would take from the first to the last column (not counting negative implicit ones, of course), `both` would be placed where the both `aside` and `content` would go, and they would be just where they would need to be.

And then, with rows being auto-placed by default, and with the columns set to one of our named columns, things would always go into correct columns!

All of this allows us to control the column names and their placement much much easier than with the square brackets `-start` and `-end` syntax. If we’d want to add another column or change the width of some of those, we could just change the visual representation. And, for example, for my site’s layout, on the narrower screen I replace the above template with this one (by using variables, of course):

``` CSS
:root {
  --grid-ascii--small:
    " full  full     full "
    " .     both     .    "
    " .     content  .    "
    " .     aside    .    ";
}
```

There everything would go into one column, and `full` would include the paddings that would be created by the grid-gaps, with the left and right columns being both equal to zero. Very convenient! But about this and other nuances I’ll write in one of my next articles.

Anyway, in this smaller layout you can see the principle even better, and here is the above example with the projection, but using this smaller layout:

{{<Partial src="examples/projection_small.html" />}}

In other words, when we have only one axis to think about, we can treat each row of the `grid-template-areas` as one of the possible representations[^any-order] of the column layout, and don’t need to think what happens to rows at all. I use this for columns, but this can also be used for rows if you’d find a case.

[^any-order]: Note that as the rows do not matter, we can write our lines with columns in any order. I prefer to start from the wider ones, and then go with the smaller, as this makes it easier to visualize what would happen if we would “flatten” this structure. <!-- span="2" offset="2" -->

But I think that for most layouts out there you would maybe want to use this trick, as you most probably would have some defined columns and then everything else auto-placed on the rows. And placing items by using names is much more convenient and readable than using numbers, so I can only recommend you to try this method!

## Simplified Example

Other than my site’s layout, there are, of course, a lot more use cases you can apply all of this. The simplest one you could probably already saw somewhere, as it doesn’t even include intersections:

``` CSS
main {
  grid-template-areas: "left middle right";
}
```

Yep, that is just your regular three-columns layout, which is rather obvious when you’re looking at it, but there is still useless row names, which exist, but you would never use them:

{{<Partial src="examples/projection_simple.html" />}}

And with this kind of layout, it is now very easy to add two intersecting combined columns:

``` CSS
main {
  grid-template-areas:
    " left        middle      right     "
    " sans-right  sans-right  .         "
    " .           sans-left   sans-left ";
}
```

Here, we just added two rows with two new wider intersecting columns: one taking left and middle one, and another taking middle and right.

{{<Partial src="examples/projection_simple_enhanced.html" />}}

This kind of layouts can be very helpful when having automated placement inside a grid, whenever you’d want things to go into specific columns.

One important thing to note: as with any other grid placement, all of this only affects the visual layout. The order of the elements in keyboard navigation and for screen readers would be always according to the source, so be cautious if you’d use this method for something where order matters.

## Dreams of the future

The only main problem of this method — its impossible[^impossible] to use when you need both rows and columns. What could be interesting — an ability to define _multiple_ templates for a grid layout, which when placed one over another, with a condition of having the same number of rows and columns, would create intersected _areas_. How cool that would be? Actually, maybe we just need a way to define three-dimensional grids? Hmmm! But I would leave you to think about the prospects of something like that for yourself. For now.

[^impossible]: Ok, not entirely impossible, there are possible _ways_ to do something like that, but I won’t get into those this time, as they’re much more fragile and won’t fit most of the use cases.

