# Future CSS: Anchor Positioning

#Experiments #Anchor_Positioning #Future_CSS #CSS_Variables #CSS

_Anchor positioning might be one of the most exciting features coming to CSS. It is currently available under an experimental flag in Chrome Canary, and after playing with it for a bit, I couldn’t stop myself from sharing what I found. In this article, I will show you some of my experiments._


## The Disclaimers

This article is quite long! Before we dive in, I want to mention a few disclaimers:

1. My testing only covers what is present in [Chrome Canary](https://www.google.com/chrome/canary/)'s experimental implementation[^Canary]. There is no guarantee that if things change, I will come back and modify the examples to work with the new version of the specs/implementation. Each demo comes with a video recording, allowing you to see how things work even if you cannot access this version of Chrome right now. However, I highly recommend checking everything in it for the complete experience.
2. Even though things could change, I still urge you to read the current [Editor’s Draft][the specs] of the “CSS Anchor Positioning” spec and play with the current implementation yourself. If you would then give your feedback to the CSSWG, that would be even better!
3. My experiments in this article do not touch all parts of the specs & the implementation. For example, I haven’t had a chance to experiment with all of the [fallback][] stuff or explore the [`anchor-scroll`][] property yet. More to think about for future experiments!
4. I would submit most of my feedback about the specs &amp; implementation in GitHub issues and would try to provide the links to them where appropriate.
5. I would not go too deep into the details of my experiments' implementation — things could change, and my goal is to show _what is possible_ rather than _how to do stuff_. The code can also be messy — it is not of production quality, could be improved a lot, and so on. You know, it is “experimental”.
6. I’m sure my experiments have room for improvement from the accessibility standpoint. If you’d notice something you know could be improved, let me know about it! My goal with the examples was to get to a proof-of-concept, so I probably cut some corners.
7. Again, this is experimental and unstable — don’t use it in production, even with graceful degradation/progressive enhancement.

[^Canary]: Version `113.0.5640.0` at the time of writing. <!-- offset="1" -->


## What is Anchor Positioning

[Jhey Tompkins](https://front-end.social/@jhey) (one of the spec editors) did publish an article that describes the basics rather nicely — [“Tether elements to each other with CSS anchor positioning”](https://developer.chrome.com/blog/tether-elements-to-each-other-with-css-anchor-positioning/) — you could want to read it to get an introduction to the whole concept of anchoring things, and for what we could use it.

I won’t try to re-explain [the specs][] or rephrase what Jhey wrote (I did most of my experiments before his article and without looking into his prior demos), but I will attempt to provide a brief description of anchor positioning as I understand it.

In short, anchor positioning _augments_ absolute[^and-fixed] positioning by allowing us to use the positions and dimensions of elements other than the element’s usual positioning context.

[^and-fixed]: And `fixed` — but, for now, not explicitly. The spec only mentions this in a few examples, but does not elaborate how it should work. When I would later mention “absolute” — consider that it _could_ as well work with “fixed”. <!-- span="3" -->

In our current CSS, absolute-positioned blocks are usually positioned _relative_ to their closest positioned ancestor or the initial containing block, so if we say something like `left: 1em` or `width: 100%`, it is that ancestor that the browser would use.

_Anchor positioning_ allows us to make our absolutely-positioned elements rely on other elements' positions and dimensions. How it works:

1. First, we need to mark our elements via a new `anchor-name` property, allowing us to use those named elements as our targets[^exceptions].

2. Then, on our absolutely positioned elements, we would need to use the `anchor()` value or `anchor-size()` to retrieve the corresponding properties of our target elements.

3. Use [`anchor-scroll`][] or position [fallback][] for more complicated cases.

[^exceptions]: Not all absolutely positioned elements could target all the named anchors — there are [“acceptable anchor elements”](https://drafts.csswg.org/css-anchor-position-1/#acceptable-anchor-element) with some criteria, I won’t go deep into this but will mention it [later in the article](#the-problem). <!-- span="3" offset="1" -->

And that’s mostly it.


## My Experiments

I would present you with what I thought we could do by using anchor positioning[^not-popovers] — through the years, I often dreamt about something like that, so it was not so hard to come up with the examples. Note that this is just a brief exploration of what is possible — this feature already looks very-very powerful, and there are many exciting possibilities to explore.

[^not-popovers]: Except for the most straightforward cases like tooltips, popovers and dialogs — I think others would cover those better. <!-- offset="1" -->

My examples will progress from basic to advanced, with elements using more and more anchors for their positioning. All examples would contain additional styling, which I won’t describe in the article (but you’re welcome to look into the source — though I did not make the code pretty, it is all very experimental and raw).


### Cross-Referencing

I will start with an example that I’d already want to use in production — otherwise, we either need to use JS, hard-coded positions, or some hacks.

That is the ability to visually _transfer_ hover or focus state from one element to another, highlighting the context that might be in a different place on the page.

{{<Partial src="examples/anchor-positioning-1-1.html" screenshot="true" video="true" >}}
Hovering or focusing on various items in this example would highlight the other corresponding elements.
{{</Partial>}}

It becomes possible to highlight something in a completely different place on the page, allowing elements to “know of each other”.

This kind of visual technique allows making it easier to discover connections between items and is often used in the wild:

- I’m using a similar behavior in my blog to “connect” the sidenotes and their content — using a [“label to input”](https://kizu.dev/label-to-input/) hack[^meta-sidenote-1].
- We’re using something like this in Datadog’s design system’s docs — to connect the examples with their code. For example, try to hover over different buttons or their displayed code on [this page](https://druids.datadoghq.com/components/form/Button?example1_state=N4IglgzgogHgDgQwHYBMCmKQC4AuAnAVzQBoQ408BbAnBHMAeyQm1ABs0A3NN7fIgL6kA1kgYAjCAGVaONNhAIaDEAKA#example1).
- I saw a mostly hard-coded example on the [CSSDay website](https://cssday.nl/2023) (hover over the speakers' names and photos to see the effect in action).

[^meta-sidenote-1]: If you’re looking at this article on a desktop, you will see that these sidenotes use this hack for cross-highlighting. I know it is not perfect, maybe I should use JS for this, actually. <!-- offset="1" -->

I saw this in other places — dataviz, code explainers, docs — the use cases are everywhere. And anchor positioning makes implementing this _very_ easy — below is the whole CSS for the example above.

```CSS
.example1 [style*='--is:'] {
  anchor-name: var(--is);
}

.example1 [style*='--for:']:is(:hover, :focus-visible)::after {
  content: "";

  position: absolute;
  top:    anchor(var(--for) top);
  right:  anchor(var(--for) right);
  bottom: anchor(var(--for) bottom);
  left:   anchor(var(--for) left);

  box-shadow: 0 0 0 4px hotpink;
}
```

And all we need to do in HTML is to provide the names and targets of our elements via `--is` and `--for` variables[^utility].

[^utility]: I talked a bit about this approach — using the inline variables for selectors — in my [“Utility of Inline Styles”](https://www.dotconferences.com/2019/12/roman-komarov-utility-of-inline-styles) dotCSS 2019 lightning talk. I have had a draft of an article about this for years — let me know if you think I should finish it! <!-- offset="1" span="4" -->

```HTML
<li style="--for: --none" tabindex="0">
  <code style="--is: --display">display</code>
</li>
```

That’s it! We define which elements are anchors, then use their positions for our absolutely positioned pseudo-element that works as this “hover” state.

A few things to note:

1. One common mistake I initially had in my experiments — using the names without the double dashes in the beginning. The spec defines the names as [`<dashed-ident>`][], so they won’t be your usual idents, like with animation names or grid areas, but more like a CSS custom property’s name.

2. While the examples use simple names for those idents, in reality, those currently behave closer to the HTML’s `id`s, so in practice, those would need to be unique.

    It is possible to have multiple anchors with the same name, but only if they’re isolated by some positioning context. The experiments that reuse the same anchor names would have the whole example wrapped with a `position: relative`. That is a bit limiting, and I’d wish there was a way to control this further.

3. Ideally, I would want to use something like `inset: anchor(var(--for))` here, but the spec does not define in any way how the inset shorthand properties should behave, so this doesn’t work (or doesn’t do what I’m expecting it to).


### Transitions

So, we can position elements over other elements, but can we change our targets dynamically? Yes, and one thing I tried immediately (and that seemed to work, partially) — transitions between those states!

{{<Partial src="examples/anchor-positioning-1-2.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal;" span="2">}}
Hovering or focusing over elements shows a moving pink ring over them.
{{</Partial>}}

HTML is, again, very straightforward — just our regular list with links inside and our “hover/focus ring” being the list’s `::before` pseudo-element.

CSS, though, is a bit hard-coded. The basics for positioning the “hover” element are the same as in the previous example, while the way we’re attaching things is different:

```CSS
.slider {
  anchor-name: --slider-menu;
  --target: --slider-menu;
}

.slider::before {
  content: "";
  position: absolute;
  top:    anchor(var(--target) top);
  left:   anchor(var(--target) left);
  right:  anchor(var(--target) right);
  bottom: anchor(var(--target) bottom);
  transition: all 0.3s;
}

.slider-link {
  anchor-name: var(--is);
}

.slider-item:nth-child(1) { --is: --item-1 }
.slider:has(:nth-child(1) > .slider-link:is(:hover, :focus-visible)) {
  --target: --item-1;
}

.slider-item:nth-child(2) { --is: --item-2 }
.slider:has(:nth-child(2) > .slider-link:is(:hover, :focus-visible)) {
  --target: --item-2;
}

/* …and so on */
```

1. We’re using a `--target` CSS variable to control to which anchor we’re attaching our pseudo-element.
2. Our anchor-positioned pseudo-element has the usual `anchor()` for the positioning, using the `--target` CSS variable.
3. By default, we’re using our wrapper as the target, making the initial transition come from “around” the items (I tried using the fallback values for the anchors — this didn’t work for the transition).
4. Then, we’re using a transition both for the positioning (essentially animating the top-right-bottom-left properties) and other visuals.
5. Each link inside would get an `anchor-name` from an `--is` CSS variable on its parent list-item.
6. For each[^for-each] `:nth-child(N)` list-item we need to:
    - Set the `--is` variable with its index.
    - On a slider, check if there is a hovered or focused link in this list-item via a `:has()` pseudo-class, and if so, assign this item as the `--target`.

[^for-each]: I wish we could use each element’s index in the DOM tree for the ident names! It would be so convenient! <!-- offset="11" -->

This method seems to work fine — when all the anchor names are statically assigned, and we dynamically change which anchor we use at any given time — the transitions work perfectly.

I also tried to do something like this, which did not work:

```CSS
.slider::before {
  content: "";
  position: absolute;
  top:    anchor(--target top);
  left:   anchor(--target left);
  right:  anchor(--target right);
  bottom: anchor(--target bottom);
  transition: all 0.3s;
}

.slider-link:is(:hover, :focus) {
  /* Does not trigger the transition :( */
  anchor-name: --target;
}
```

But while the positioning itself works — we can dynamically assign the `anchor-name` to the hovered items — the transitions do not. But how elegant it could’ve been if re-assigning the `anchor-name` resulted in the same transition between the old and new states!

### “Four Quadrants”

In the previous experiments, I only connected each element to one other. However, nothing prevents us from using multiple anchors _simultaneously_ on a single element. And with two or more connections, things immediately become much more captivating.

I think the technique I would be talking about now would get _a lot_ of traction[^jhey] — the ability to anchor things to multiple elements simultaneously, thus creating _connections_ between them. It could be an invaluable feature for displaying various decorations — one that previously required dynamic on-the-fly calculations, probably involving resize or intersection observers.

[^jhey]: See, for example, [Jhey](https://front-end.social/@jhey)'s [thread](https://front-end.social/@jhey/109904731199935321), where he demonstrates independently discovering the same technique. <!-- offset="1" -->

The examples in this section would contain two elements inside a box, with their positions animated, allowing us to conveniently check how the anchor positioning would work for various arrangements of those elements relative to each other.

A small disclaimer about this animation’s limitations:

1. I’m using the animation for `top` & `left` in a `position: relative` context. Ideally, for better performance, we could want to use a `transform` or maybe even an [`offset-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Motion_Path), but — anchoring would be calculated _before_ any transforms and offset-path, so we cannot (hopefully, yet?) rely on these.

2. I could position the elements absolutely instead of relatively, but for this, I would need to change the layout, as there are currently limitations in attaching things to other absolutely positioned elements. More on this later.

#### The Challenge

To begin[^skip-to-result], I’ll describe some of the details of the challenge to help illustrate the problem.

[^skip-to-result]: Feel free to [skip to the final technique](#the-technique-itself) if you don’t want to read this preamble. <!-- span="2" -->

In the first example, let us do this:

```CSS
.example2--intro .connection {
  top:    anchor(var(--_from) center);
  left:   anchor(var(--_from) center);
  right:  anchor(var(--_to)   center);
  bottom: anchor(var(--_to)   center);
}
```

Here we use one element in anchors for `top` and `left`, and another for `right` and `bottom`:

{{<Partial src="examples/anchor-positioning-2-0.html" screenshot="true" video="true" style="width: 450px; justify-self: center; overflow: hidden; resize: horizontal;">}}
Hovering or focusing over this and following examples allows us to see their animation. Remember — no JS was involved in any of the experiments on this page.
{{</Partial>}}

We can see that this allows us to draw a rectangle between both elements, but only when they’re positioned in a very particular way — the first element should have `x` and `y` coordinates smaller than the second one. Otherwise, the final box would have a computed width or height equal to zero, so we would essentially see our box in ¼ of all the cases.

Now, my first idea to fix this was to do the following:

```CSS
.example2--min .connection {
  top: min(
    anchor(var(--_from) center),
    anchor(var(--_to)   center)
  );
  left: min(
    anchor(var(--_from) center),
    anchor(var(--_to)   center)
  );
  right: min(
    anchor(var(--_from) center),
    anchor(var(--_to)   center)
  );
  bottom: min(
    anchor(var(--_from) center),
    anchor(var(--_to)   center)
  );
}
```

Because math functions like `calc()` or `min()` support anchor values inside, we can always choose an appropriate element’s position and get the box drawn always!

{{<Partial src="examples/anchor-positioning-2-1.html" screenshot="true" video="true" style="width: 450px; justify-self: center; overflow: hidden; resize: horizontal;">}}
{{</Partial>}}

This shows how we can “draw” a rectangle between two points! And there is no transition or animation on the rectangle — it just gets its `top`, `right`, `bottom`, and `left` from the two circles.

Why is this not the final technique? I don’t think there are _a lot_ of use cases for _this exact_ solution — all due to the rectangle not being aware of the actual circle positions. It might seem that the rectangle “rotates”, but it really doesn’t. We can easily see this if we would add a background with a gradient that has corners matching our elements:

{{<Partial src="examples/anchor-positioning-2-2.html" screenshot="true" video="true" style="width: 450px; justify-self: center; overflow: hidden; resize: horizontal;">}}
Corners match up only for the initial position but not when the elements' arrangement changes.
{{</Partial>}}

We can see that the red color is always in the top left, and violet — in the bottom right, not corresponding with the appropriate element’s color.

What we could want is to be able to determine the actual direction here. However, the current spec doesn’t allow us to. If only we could use the `anchor()` and `anchor-size()` for things like `background-size`, `background-position` and `transform` — this could potentially help us determine the relative positions of our elements and could allow us to achieve this and much more complicated effects!

#### The Technique Itself

Until we would get something that would allow us to do this on one element, here is a demonstration of the technique that I propose:

{{<Partial src="examples/anchor-positioning-2-3.html" screenshot="true" video="true" style="width: 450px; justify-self: center; overflow: hidden; resize: horizontal;">}}
Corners now correctly line up with their items.
{{</Partial>}}

What did we do to achieve this? Well, this is kind of a hack where we’re using the behavior from the very first example but on multiple elements:

``` HTML
<div class="connection"></div>
<div class="connection connection--flip-x"></div>
<div class="connection connection--flip-y"></div>
<div class="connection connection--flip-x connection--flip-y"></div>
```

And the (slightly simplified) CSS:

```CSS
.example2--with-workaround .connection {
  top:    anchor(var(--_from) center);
  left:   anchor(var(--_from) center);
  right:  anchor(var(--_to)   center);
  bottom: anchor(var(--_to)   center);
  --flip-x: 0;
  --flip-y: 0;
  transform:
    scaleX(calc(1 - 2 * var(--flip-x)))
    scaleY(calc(1 - 2 * var(--flip-y)));
}
.example2--with-workaround .connection--flip-x {
  left:  anchor(var(--_to)   center);
  right: anchor(var(--_from) center);
  --flip-x: 1;
}
.example2--with-workaround .connection--flip-y {
  top:    anchor(var(--_to)   center);
  bottom: anchor(var(--_from) center);
  --flip-y: 1;
}
```


Instead of one element with the `min()`, we can use four, only one of which would be visible at any point. The rest would have one or both dimensions equal to zero. Then, we are also flipping the element via a `transform`, so we won’t need to modify anything in how the gradient in its background is implemented (it is possible to also just provide different content for each quadrant when necessary, but for a visual-only effect that does not contain any text inside I find the “transform” the simplest).

This method allows us to create various effects:

{{<Partial src="examples/anchor-positioning-2-4.html" screenshot="true" video="true" style="width: 450px; justify-self: center; overflow: hidden; resize: horizontal;">}}
We can connect as many items as we want.
{{</Partial>}}

{{<Partial src="examples/anchor-positioning-2-5.html" screenshot="true" video="true" style="width: 450px; justify-self: center; overflow: hidden; resize: horizontal;">}}
We can draw something inside using HTML & CSS and maybe even utilize container queries for swapping based on orientation!
{{</Partial>}}

{{<Partial src="examples/anchor-positioning-2-6.html" screenshot="true" video="true" style="width: 450px; justify-self: center; overflow: hidden; resize: horizontal;">}}
Or use an SVG with its overflow behavior and the `marker`'s auto-rotation.
{{</Partial>}}

And so on — even with this non-ideal workaround, we could already do _a lot_ of different effects using this type of connection as a building block.

This ability to connect elements visually can be incredibly versatile, and we did not have anything like that available with just plain HTML&CSS before.

### Using the Connections

There are so many things I want to implement using these connectors! But if I tried to do all that was there in my head, I would never finish this article.

So, for this one, I would put just one practical example:

{{<Partial src="examples/anchor-positioning-3.html" screenshot="true" video="true" a11y="true" style="position: relative; overflow: hidden; resize: horizontal;">}}
The example shows lines connecting items with their parents in a nested tree list with `<details>` allowing collapsing branches.

Thanks to [Yoksel](@yoksel_en)'s [URL-encoder for SVG](https://yoksel.github.io/url-encoder/), I embedded the SVG as a background for pseudo-elements.

Note that I have no idea what I’m doing when handling SVG — so if something could be improved or fixed — let me know!
{{</Partial>}}

How cool is that? This list does not have any positions hard-coded — the only thing we need to set up is all the connections in HTML. Then, anchor positioning would be responsible for placing all the connectors.

```CSS
.tree-item-label {
  line-height: var(--lh);
  anchor-name: var(--is);
}
.tree-item-label::before,
.tree-item-label::after {
  position: absolute;
  content: "";
  left:  anchor(var(--to) right);
  right: anchor(var(--is) left);
  /* background with an SVG for the connectors */;
}
.tree-item-label::before {
  top:    calc(anchor(var(--to) top) + 0.5 * var(--lh));
  bottom: anchor(var(--is) center);
}
.tree-item-label::after {
  bottom: calc(anchor(var(--to) top) - 0.5 * var(--lh));
  top:    anchor(var(--is) center);
  transform: scaleY(-1);
}
```

We can see how we can connect our pseudo-elements to two elements and also modify the value with a `calc()` — in this case, I’m attaching the left part not to the center of the element but to the center of the first line — as if the text would wrap[^wrap]. Due to an uneven right edge, it is better not to point the connectors to the center. An alternative to a calculation could be placing an inline element at the item’s start, then targeting its vertical position instead.

[^wrap]: If you can — you can try resizing the page — things will mostly adapt correctly when the words would wrap. <!-- offset="3" span="2" -->

Sadly, the HTML structure is not _super_ lean here:

```HTML
<ul class="tree">
  <li class="tree-item" style="--is: --node-1">
    <p class="tree-item-label">CSS selectors</p>
    <ul class="tree" style="--to: --node-1">
      <li class="tree-item" style="--is: --node-1-1">
        <p class="tree-item-label">Basic selectors</p>
        <ul class="tree" style="--to: --node-1-1">
          <li class="tree-item" style="--is: --node-1-1-1">
            …
```

Here we have to:

1. Define the current root node on each `li` that has nested items.
2. Reuse it, setting as `--to` on the nested `ul`.

Potentially, we could eliminate the second part if we could have something like `inherit()` in CSS[^inherit].

[^inherit]: If you also want something like this — you can like [this GitHub issue](https://github.com/w3c/csswg-drafts/issues/2864) by [Lea Verou](https://front-end.social/@leaverou). <!-- offset="1" span="2" -->

### Tables

This experiment is more of a continuation of the first one — where we’re highlighting something, but this time we’re basing things on two or more elements at the same time:

{{<Partial src="examples/anchor-positioning-1-3.html" screenshot="true" video="true">}}
Hovering/focusing over the spans with dotted underlines highlights the corresponding cells in the table.

Data: [caniuse.com/css-sticky](https://caniuse.com/css-sticky).
{{</Partial>}}

In the example above, we have a regular HTML table where we can highlight any cells we want from the outside, declaring them based on which rows/columns we want to highlight.

Without anchor positioning, this is almost impossible to achieve with just CSS — this can be _kinda_ possible if we would implement the table using CSS grids, but we’d have _a lot_ of problems, starting from accessibility (as we’d need to override table display), and finishing with the “outside of the table” requirement — we’d need to hack things in some way structure-wise; otherwise, the grid’s named rows and columns won’t be available outside of it.

And even though we could do something similar when using `:has()`, we could not style only _specific cells_ and not any arbitrary spans without heavy hard-coding.

But with anchors, things are _so easy_!

Like, here is the whole CSS that defines our anchors and the API to access them on a `.pointer` class:

```CSS
.example1b tbody {
  anchor-name: --tbody;
}
.example1b [style*='--column-id:'] {
  anchor-name: var(--column-id);
}
.example1b [style*='--row-id:'] {
  anchor-name: var(--row-id);
}
.example1b .first-column::before {
  content: "";
  display: block;
  margin-inline: -0.5em;
  anchor-name: --first-column;
}
.example1b .pointer {
  --column: initial;
  --row: --tbody;
  --column-start: var(--column, --first-column);
  --column-end:   var(--column, --tbody);
  --row-start:    var(--row);
  --row-end:      var(--row);
  text-decoration: underline;
  text-decoration-style: dotted;
}
.example1b .pointer:is(:hover, :focus-visible)::before {
  content: "";
  position: absolute;
  top:    anchor(var(--row-start)    top);
  bottom: anchor(var(--row-end)      bottom);
  left:   anchor(var(--column-start) left);
  right:  anchor(var(--column-end)   right);
  outline: 2px solid hotpink;
  border-radius: 0.5em;
}
```

In HTML, the header cells and rows are the only elements that require anchors. No need to duplicate anything on the cells themselves! And then, it becomes trivial to add a highlight by using a `.pointer` with CSS API:

```HTML
<span
  tabindex="0"
  class="pointer"
  style="
    --column: --firefox;
    --row-end: --partial;
  "
>
  Firefox 58 & below
</span>
```

In this example, whenever we target something, we can use from 2 to 4 different elements as targets for our absolutely positioned element.

A few notes:

1. Look at how we don’t have anything hard-coded in CSS — we only mention rows & columns, we don’t mention any specific names, and so on.
2. For targeting the first column, we have to create a pseudo-element, as we can’t assign two different anchor names to the same element, so we have to add an extra one just for the additional anchor name. While we could mention the `--chrome` anchor there, that would mean hard-coding it into wedon't it less reusable. Another in CSS option would be to define an additional API for the component, where we could provide the “first column” via a separate CSS variable.
3. We can use a CSS-like API with “shorthands” for rows/columns when mentioning them, by default targeting everything from the first column and row to the end of the `tbody` and allowing specifying any of the boundaries manually, either as a whole row or column, or only a specific part like a start or end.

I’m fascinated by how we can use modern CSS to define such expressive APIs for our components!

### Sidenotes Layout

For the final experiment, I wanted to do something different. Maybe not as shiny and captivating _visually_, but something that tries to get the maximum of what we could from the anchor positioning — trying to apply it for _layouts_[^layouts].

[^layouts]: Unlike other examples, this one could be harder to handle from a graceful degradation standpoint. Even when the anchor positioning becomes available, we will still need to be careful about using it for such purposes. <!-- offset="3" span="3"  -->

When we talk about absolute positioning in the context of layouts, we often think of it as this very fragile/hard-coded way of doing them, as absolutely positioned elements do not know anything about each other, so it is hard to make things responsive or context-aware.

With anchor positioning, we can make them behave with more sophisticated rules, especially when we can attach one absolutely-positioned element to another. Though currently there is a significant limitation in _when_ this works, making the actual usage of this behavior complicated and probably not production-friendly — let’s first look at the example.

For the example[^fun-fact], I chose, once again, a thing that is present in the design of my blog, which is, again, the side-notes!

[^fun-fact]: Fun fact about this anchor positioning usage — it was mentioned as a use case in [Eric Meyer](https://mastodon.social/@Meyerweb)'s [CSS Wish List 2023](https://meyerweb.com/eric/thoughts/2023/02/08/css-wish-list-2023/#anchored-positioning). <!-- offset="-1.75" -->

{{<Partial src="examples/anchor-positioning-4.html" screenshot="true" video="true" a11y="true" style="overflow: hidden; resize: horizontal;">}}
This example only makes sense on a wide screen — in a narrow context, the sidenotes would become just footnotes, appearing at the end of the text, but when wide enough, you should see the experiment in action.

By the way, the text of the experiment describes what is happening inside of it as a kind of alt text.
{{</Partial>}}

I won’t show you the complete code of this experiment, as a lot is going on in it, and the basics of anchor positioning are the same as for the previous examples, with the following exceptions:

1. Here is the CSS declaration that does most of the work:

    ```CSS
    top: max(
      anchor(var(--for)  top),
      anchor(var(--prev) bottom) + 0.5em
    );
    ```

    Here we’re using the `max()` to decide where we would show the sidenote — either on the line with its designated reference (`top` of the `--for` one) or 0.5em below the sidenote or figure before it (`bottom` of the `--prev`; note how we can use calculations inside `max()` without `calc()`).
    
2. The worst part of this demo is the HTML. While aligning the elements on the same line as their references works as expected, the other sidenotes with `--prev` have absolute position. It leads to very limiting consequences — a need to _hack_ the HTML to make this work. And this hack is very ugly.

#### The Problem

Let me quote the place from the specs — [the definition of the _acceptable anchor_](https://drafts.csswg.org/css-anchor-position-1/#acceptable-anchor-element) that describes our limitations:

> An element `el` is a acceptable anchor element for an [absolutely positioned](https://drafts.csswg.org/css-position-3/#absolute-position) element `query el` if any of the following are true:
> -   `query el` is in a higher [root layer](https://drafts.csswg.org/css-anchor-position-1/#root-layer) than `el`.
> -   `query el` and `el` are in the same [root layer](https://drafts.csswg.org/css-anchor-position-1/#root-layer), and all of the following are true:
>     -   Either `el` is a descendant of `query el`’s [containing block](https://drafts.csswg.org/css-display-4/#containing-block), or `query el`’s containing block is the [initial containing block](https://drafts.csswg.org/css-display-4/#initial-containing-block).
>     -   If `el` has the same [containing block](https://drafts.csswg.org/css-display-4/#containing-block) as `query el`, `el` is not [absolutely positioned](https://drafts.csswg.org/css-position-3/#absolute-position).
>     -   If `el` has a different [containing block](https://drafts.csswg.org/css-display-4/#containing-block) from `query el`, the last containing block in `el`’s [containing block chain](https://drafts.csswg.org/css-display-4/#containing-block-chain) before reaching `query el`’s containing block is not [absolutely positioned](https://drafts.csswg.org/css-position-3/#absolute-position).
> 
> For the purposes of this algorithm, an element is in a particular root layer corresponding to the closest [inclusive ancestor](https://dom.spec.whatwg.org/#concept-tree-inclusive-ancestor) that is in the [top layer](https://fullscreen.spec.whatwg.org/#top-layer), or the document if there isn’t one. [Root layers](https://drafts.csswg.org/css-anchor-position-1/#root-layer) are “higher” if their corresponding element is later in the top layer list; the layer corresponding to the document is lower than all other layers.

Ok, so the first problem — this description sounds maybe a bit too complicated. Did you get what it talks about right away?

I imagine there are a lot of nuances, but I’ll try to rephrase it at least in the context of our example:

> Our absolutely-positioned element cannot target another absolutely-positioned one if they exist inside the same positioning context. So, the two siblings could not target one another.
> 
> However, if the structure is such that one of the elements has a relatively positioned wrapper, the outer element could target the inner, but not vice versa.

At least, this is how it works for the current implementation: we cannot just place our sidenotes as siblings one after another in the end. We need to hack around this limitation.

#### The Hack

The hack is “simple”: for **each** sidenote, we need to add another wrapper around our content, then place our sidenotes in the end, at each level. Here is how it looks approximately:

```HTML
<div class="wrapper">
  <div class="wrapper">
    <div class="wrapper">
      <div class="wrapper">
        <h1 />, <p /> and other content
        
        <aside class="sidenote" />
      </div>  
      <aside class="sidenote" />
    </div>
    <aside class="sidenote" />
  </div>
  <aside class="sidenote" />
</div>
```

It works! But oh, how bad this is to handle!

I find this behavior very unnecessarily limiting. I know why it is there — to prevent the circularity issues, but I think there _must be_ other ways to solve this.

For example — what if one more acceptable condition (when nothing else works) would be the dependence on the DOM order? Something like “an element later/deeper in the DOM tree can target an element earlier/upper, but not the other way around.” This way, we would not have an issue with circularity — as the elements could create a dependency chain/tree only in one direction! Combined with the other cases, where we are free to target non-positioned elements in any direction, this could create quite a versatile way of doing things.

At least, the case above with the sidenotes would work without extra wrappers — we would only need to mention the previous item.

We would still not have the ability to cross-reference elements in both ways — I don’t think we can target things inside those absolutely positioned elements from our references, and there could be other limitations, or maybe even other workarounds — but unlocking the DOM-order-dependent targeting for absolutely positioned elements would be tremendously helpful.

## Conclusion

That’s it for now. I did _a lot_ of other experiments — some of which were also very promising, but if I had tried to fit everything into this article, I would’ve never finished it. The last few years have been _very_ good for CSS in general, with so many great features coming our ways, and we have so many other things on the roadmap! Maybe I would write more about anchor positioning, or I would write about something else — I don’t know yet. But the future is bright, and so many once-impossible things become closer and closer to us.

It was quite long since I submerged myself that deep into experimenting, and I already know that I missed so many things! I strongly encourage you to try experimenting, and see if you could solve your use cases with all the new tools we’re getting, and if not — give your feedback to the spec-writers and browser developers. It would make things better for everyone.


[the specs]: https://drafts.csswg.org/css-anchor-position-1/
[fallback]: https://drafts.csswg.org/css-anchor-position-1/#fallback
[`anchor-scroll`]: https://drafts.csswg.org/css-anchor-position-1/#scroll
[`<dashed-ident>`]: https://drafts.csswg.org/css-values-4/#typedef-dashed-ident
