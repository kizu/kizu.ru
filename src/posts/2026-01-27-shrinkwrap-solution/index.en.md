---
mastodon_post_id: "115966776474014598"
---

# Solving Shrinkwrap: <span class="wrp">New Experimental Technique</span>

#Anchor_Positioning #Scroll_Driven_Animations #Future_CSS #Experiment #CSS

_In this article, I present my new technique for solving a CSS problem that was deemed impossible — true shrinkwrapping of an element with auto-wrapped content. By using anchor positioning and scroll-driven animations, we can adjust our element’s outer dimensions by measuring its inner contents, demonstrating that for many cases this can already work and might unlock a future native feature._

<style>
.wrp {
  display: inline-block;
  max-width: 100%;

  font-size: 0.85em;
}
</style>

{{<Partial src="examples/01-intro.html" class="require-timeline-scope example-resizer example-resizer--intro" screenshot="true" video="true" offset="0.25" span="2">}}
On the left: an element that wraps without shrinkwrap fix. On the right: the box is tightly wrapped with a fix and centered. Resizing the example demonstrates what the problem looks like in a dynamic context.
{{</Partial>}}


Since [anchor positioning](/anchor-positioning-experiments/) and [scroll-driven animations](/scroll-driven-animations/) appeared on my radar, I knew they would unlock things that were not possible before. These new CSS features hook into many things that were previously either impossible or available only through cumbersome JavaScript APIs. Two years ago, I wrote about one of such things — the “shrinkwrap” problem and a partial decorative workaround that used anchor positioning — in my [“The Shrinkwrap Problem: Possible Future Solutions”](/shrinkwrap-problem/) article.

After writing that article, and experimenting more with scroll-driven animations, I knew that there could be a way to combine those and achieve shrinkwrapping not just _visually_, but also make it affect the layout. In the last few months, I was experimenting with my past findings and a few novel approaches, and, finally, honed them into something reusable — and already working in stable Chrome and Safari, with a graceful degradation[^graceful-degradation] for other browsers.

[^graceful-degradation]: It really helps that this technique is mostly _decorative_: when it doesn’t work well, things do not look _as good_, but everything still _works_. It is pretty similar to features like `text-wrap: balance`, where it can be used to improve some existing designs or make new ideas possible, while not compromising on the functionality. <!-- offset="6" span="4" -->

## Disclaimer

That said, even though my examples for the base technique might work in the latest versions of some stable browsers, the technique itself is **highly** experimental.

For example, I experienced [occasional crashes in Safari](#a-crashing-safari-bug). I managed to find a workaround, but I strongly suggest being careful before using anything from this article in production.

## The Problem

Let’s say we have a simple header, which we style to look like a nice rounded box, and that should shrink to its `max-content`:

<figure class="simple-example example-resizer">
<style>.simple-example {
  h5 {
    max-width: max-content;
    padding: 0.5em 1em;
    margin: 1em;
    background: var(--PINK);
    text-align: left;
    text-wrap: balance;
    border-radius: 1em;
  }
}</style>
<h5>I am a Short Header!</h5>
</figure>

When it is short, all is good! But we anticipate that it might wrap when the content is longer, and add `text-wrap: balance` to make it prettier. But then, this happens:

<figure class="simple-example example-resizer">
<h5>I am a Longer Header; I Will Wrap & Look Bad! <span style="display: var(--initial-at-large, none)">Oh no! What Can We Do?</span></h5>
</figure>

On most viewports, you could see how when the header wraps, we get all this extra space on one side — <dfn>the shrinkwrap problem</dfn>. What exactly is happening, and why is it so challenging to make it work?

I’ll quote [my first article about shrinkwrap](/shrinkwrap-problem/):

> When different content wraps — be it text, floats, inline-blocks, flex, or grid, — if that wrapping is automatic (without hard breaks), the way CSS calculates the final width is limited. The element with wrapped items gets expanded to fill all the available space.
>
> In [CSS2 specs](https://drafts.csswg.org/css2/), this behavior is called [“shrink-to-fit”](https://drafts.csswg.org/css2/#shrink-to-fit-float):
>
> > shrink-to-fit width is: min(max(preferred minimum width, available width), preferred width)

This is a problem people have stumbled over and over from the beginning of time.

<details>
<summary><span class="Link Link--pseudo">Under a cut — a long (not comprehensive) list with many links!</span></summary>

- In 2015, [Elika J. Etemad](https://fantasai.inkedblade.net/) wrote about it to the www-style mailing list: [“True Shrinkwrapping”](https://lists.w3.org/Archives/Public/www-style/2015Feb/0255.html). She even already mentioned `text-wrap: balance` in the code example!

- In 2016, [yisibl](https://github.com/yisibl) opened an issue #191 on CSSWG’s GitHub, [“How to shrink to fit the width?”](https://github.com/w3c/csswg-drafts/issues/191), showing a use case for wrapping of items inside a flexbox layout. Most of the following cases are from this issue.

- In 2017, [Vasilis van Gemert](https://vasilis.nl/) questioned if this can be fixed in his blog post [“How do I fix this CSS alignment issue?”](https://vasilis.nl/nerd/old/fix-css-alignment-issue/), about a left-aligned block that, when wrapped, should be aligned as a whole to the right.

- In 2018, [Nadya678](https://github.com/Nadya678) opened [a duplicate issue about this](https://github.com/w3c/csswg-drafts/issues/2314).

- Also in 2018, [Benoît Rouleau](https://benface.com/) [provided another use case](https://github.com/w3c/csswg-drafts/issues/191#issuecomment-440851602) in the issue #191. The CodePen in question is no longer accessible, but from the description, it sounds like the [underlined headers use case](https://kizu.dev/shrinkwrap-problem/#even-more-heading-decorations) from my previous article about shrinkwrap.

- In 2019, [Dan Tonon](https://github.com/Dan503) also [provided his use case](https://github.com/w3c/csswg-drafts/issues/191#issuecomment-495902457) in the same issue. This is probably the hardest to solve use case — a menu.

- In 2020, Dan stumbled upon this again and opened [a duplicate issue](https://github.com/w3c/csswg-drafts/issues/4801) with the same case.

- Starting from 2023, we saw a resurgence of reports about this issue thanks to the work on `text-wrap: balance` which highlighted this issue. Many people did write about it then:

    - On March 3, [Adam Argyle](https://nerdy.dev/) [wrote about a few use cases](https://github.com/w3c/csswg-drafts/issues/191#issuecomment-1453728164).
    - On September 7, [Šime Vidas](https://šime.eu/) [linked](https://github.com/w3c/csswg-drafts/issues/191#issuecomment-1710409903) to a related Reddit post, which had a “message” use case.
    - I published my [“The Shrinkwrap Problem: Possible Future Solutions”](https://kizu.dev/shrinkwrap-problem/) article in December.

- In 2024 this continued:

    - On April 23, [Lea Verou](https://lea.verou.me/) [highlighted the `text-wrap: balance` issue](https://github.com/w3c/csswg-drafts/issues/191#issuecomment-2072372597) once again.
    - On May 3, [Vincent Rubinetti](https://vincentrubinetti.com/) [linked](https://github.com/w3c/csswg-drafts/issues/191#issuecomment-2093398843) to a [JS workaround on StackOverflow](https://stackoverflow.com/questions/14596213/shrink-div-to-text-thats-wrapped-to-its-max-width/78307608#78307608).
    - On May 19, [Tomer Aberbach](https://tomeraberba.ch/) wanted to replace a JS lib with `text-wrap: balance` and couldn’t because of this issue.

- 2025!

    - On April 18, [Miriam Suzanne](https://www.miriamsuzanne.com/) [stumbled](https://github.com/w3c/csswg-drafts/issues/191#issuecomment-2814514579) upon the `text-wrap: balance` use case as well.
    - On May 21, [Mo Beigi](https://mobeigi.com/) [ran into one of the original use cases](https://github.com/w3c/csswg-drafts/issues/191#issuecomment-2898445663) for the menu.
    - On May 27, [Stephanie Eckles](https://thinkdobecreate.com/) mentioned [a tooltip use case](https://github.com/w3c/csswg-drafts/issues/191#issuecomment-2913027795) they had in Adobe, one that we have as well in Datadog.
    - On July 21, Lea returned to this problem, opening a [new duplicate issue](https://github.com/w3c/csswg-drafts/issues/12505) with a proposal to use `fit-content` or something similar for this.
    - On October 23, [Svein Alexander Frotjold](https://github.com/svefro) [provided another use case](https://github.com/w3c/csswg-drafts/issues/191#issuecomment-3434943102) with alignment of form fields.

And this is just mostly mentions from the #191 issue — there are also [many StackOverflow issues](https://stackoverflow.com/search?q=the+shrinkwrap+problem+css) and likely other places where authors wrote about this.

- - -

</details>

This article will show how we could solve almost all of these cases.

## Solutions

The bulk of all use cases are “simple”: we have a pre-defined space in which we have our element that could wrap, with the _wrapped_ state often being the default one. There, we never want to use `max-content` for the element’s width, and these elements generally do not depend on the surrounding context but want just their box to be flush with text or the surrounding context to _depend_ on our wrapped box.

These cases are solved either by the [base technique](#the-base-technique), or by [a more advanced version](#solving-for-complex-content) of it where we have to measure multiple items.

The hardest cases are those like the menu items, where _every_ item might wrap, and _by default_, they want to be sized as `max-content`. I admit that my technique is not a good fit for these cases, but I will [attempt to solve that](#cross-dependencies-menu-use-case) as well, although through an extension of the base technique that uses content duplication.

### The Base Technique

Here is how I will present the technique:

1. I will list [the limitations and corresponding prerequisites](#limitations--requirements) for using this basic technique.

2. The [full code](#full-code) for the abstracted technique is placed under a cut — if you are eager to try to understand what is going on inside without my lengthier explanations, feel free to read it! Although I placed many comments inside, which helps.

3. Not all of that code is needed for the [simplest of cases](#simple-case): first, I will iteratively explain how we solve the common case of an element with `text-align: left`.

4. Then, I will [complete the technique](#non-left-text-alignment) by handling the non-left text alignment.

5. Finally, I will show how to use the technique as a building block for handling more complex cases with [multiple nested phrasing contents](#multiple-nested-phrasing-contents).

#### Limitations & Requirements

The prerequisites for being able to use this technique are:

- Generally, we’d want to have some `container-type: inline-size` around our element, as its default max-inline-size will use `100cqi`, and most use cases will want to use `cqi` in one way or another.

- The element’s `max-inline-size` should not depend[^not-depend] on its siblings. For the technique to work, we will need to set it to a value in `px`, which could depend on its container through the container query length units. But we can’t have our element respond to `flex-shrink` or `flex-grow`: when placed in a flex or grid context, its width will be more or less static.

- Our element must have only [phrasing content](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Content_categories#phrasing_content), or, in other words, should contain only inline elements inside. Replaced elements like `<img />` are allowed inside, alongside anything with `inline-block`, `inline-flex`, and other `inline-`s, like the future [`inline grid-lanes`](https://github.com/w3c/csswg-drafts/issues/10961).


[^not-depend]: This _is_ possible to do, but only through content duplication, for now; see the [“Cross-Dependencies: Menu Use Case”](#cross-dependencies-menu-use-case) section. <!-- offset="3" -->

#### Full Code

If you’re curious, you can peek at the full code of the technique. It is thoroughly commented and might cover some of the things I did not cover in this article. That said, I tried to expand on many things in later sections, so keep reading if you want to get the most of that info in a more readable form!

<details>
<summary><span class="Link Link--pseudo">The full code of the technique.</span></summary>

```CSS
/*
  The shrinkwrap technique.
  https://kizu.dev/shrinkwrap-solution/
*/
.shrinkwrap {
  /*
    This should be easy to override, so placing the
    custom property defaults in a separate layer.
  */
  @layer defaults {
    /*
      We cannot use `%` for either; use `cqi` instead.
      Ideally, `progress()` would allow us to do it:
      https://github.com/w3c/csswg-drafts/issues/13315
    */
    --sw-limit: 100cqi;
    --sw-padding: 0px;
    --sw-inner-padding: 0px;
    --sw-inset: initial;
    --sw-source: initial;

    /*
      Cyclic toggles, allowing turning the technique
      on and off. See https://kizu.dev/cyclic-toggles/
    */
    --sw-enabled: var(--sw-enabled--on);
    --sw-enabled--on: var(--sw-enabled,);
    --sw-enabled--off: var(--sw-enabled,);

    /*
      Override the toggle when the timeline-scope is not
      supported, which will disable everything nicely.
    */
    @supports not (timeline-scope: --f) {
      --sw-enabled: var(--sw-enabled--off) !important;
    }
  }

  /* Deriving an inner value to include the paddings. */
  --_sw-limit: calc(
    var(--sw-limit)
    -
    2 * var(--sw-padding)
  );

  /*
    Must be `block`, `flow-root`, etc, so could be nested
    in a flexbox/grid, but can’t establish one itself.
  */
  display: block;

  /*
    The content part will likely overflow due to the
    inner box being larger.
  */
  overflow: hidden;

  /* Lifting the scope of view timelines from inside. */
  timeline-scope: --_sw-x;

  /*
    Accessing the start and end coordinates of the
    inner element via scroll-driven animations.
  */
  animation: var(--sw-enabled--on,
    --_sw-x-start linear both,
    --_sw-x-end   linear both
  );

  /*
    We will be using the “resolution” as a range to
    retrieve the width of various things.
  */
  --_sw-resolution: 10000px;
  animation-range:
    0               var(--_sw-resolution),
    contain contain var(--_sw-resolution);
  animation-timeline: --_sw-x;

  /*
    Calculating the actual size from the variables applied
    via the animation with the given resolution.
  */
  --_sw-size:
    (var(--_sw-x-start) - var(--_sw-x-end))
    *
    var(--_sw-resolution)
  ;
  /*
    For the main size, clamp the result within limits,
    and guard everything with a space toggle.
  */
  inline-size: var(--sw-enabled--on,
    clamp(
      0px,
      var(--_sw-size),
      var(--_sw-max-size)
    )
  );
  /* Min-size should not be clamped. */
  min-inline-size: max(
    0px,
    var(--_sw-size)
  );

  /*
    We need to always round down the `max-inline-size`;
    otherwise, if it uses `cq` units, it could get weird
    in Safari.
  */
  --_sw-max-size: round(
    down,
    max(
      0px,
      var(--_sw-limit)
    ),
    1px
  );

  /*
    Our shrinkwrapped box will behave as `content-box`,
    so we need to “enforce” the `content-box` here to
    prevent the double-counting of the extra space
    that could happen otherwise.
  */
  box-sizing: content-box !important;

  /*
    This can’t be changed from outside for the
    base technique.
  */
  flex-grow: 0 !important;
  /* Allow shrinking when the technique is disabled. */
  flex-shrink:
    var(--sw-enabled--on, 0)
    var(--sw-enabled--off, 1)
    !important
  ;
  /* Don’t limit the max size when disabled. */
  max-inline-size:
    var(--sw-enabled--on, none)
    var(--sw-enabled--off, var(--_sw-limit))
    !important
  ;
}

.shrinkwrap-content {
  /* Must be specifically `block`, nothing else. */
  display: block;

  /* Required for establishing the view timeline. */
  overflow: hidden;

  /*
    Required for getting non-anchored positioning
    dimensions.
  */
  position: relative;

  /*
    Crucial part: the content element should always
    be max-sized and independent of anything else,
    unless the technique is disabled.
  */
  inline-size: var(--sw-enabled--on, var(--_sw-max-size));

  /* Makes shrinking not be hidden by the overflow. */
  min-inline-size: min-content;

  /*
    The following styles should only apply for the
    browsers that support `timeline-scope`, which is
    currently the furthest from being implemented in
    Firefox on 2026-01-26.
  */
  @supports (timeline-scope: --f) {
    /* Guard by the cyclic toggle. */
    inset-inline-start: var(--sw-enabled--on,
      min(
        0px,
        var(--_sw-x-start) * var(--_sw-resolution)
        -
        var(--_sw-max-size)
      )
    );
  }
}

.shrinkwrap-source {
  anchor-name: var(--sw-source, --_sw-source);

  /*
    Must be specifically `inline` by default.
    Allows anchor positioning to measure it’s size
    and its offset.
  */
  @layer defaults {
    display: inline;
  }
}

/*
  Creating the “probing” element that will be used to
  measure the source element’s dimensions and offset.
*/
@supports (timeline-scope: --f) {
  /*
    We cannot use `::before` here due to a WebKit bug:
    https://bugs.webkit.org/show_bug.cgi?id=302703
  */
  .shrinkwrap-probe {
    position: absolute;
    /* Could also be `visibility: hidden` in production. */
    pointer-events: none;

    /* Anchoring to the source element. */
    position-anchor: var(--sw-source, --_sw-source);

    /* Not strictly required, but better to be explicit. */
    inset-block: 0;
    /* Key part for calculating the text-align offset. */
    inset-inline: var(--sw-inset, anchor(inside, 0px));
    /* Accounting for the inner spacing if needed. */
    margin: calc(-1 * var(--sw-inner-padding, 0px));

    /* Exposes the element to the scope on an ancestor. */
    view-timeline: --_sw-x inline;
  }
}

/*
  Custom properties that will be applied via scroll-driven
  animations, with the value from 0 to 1.
*/
@property --_sw-x-end {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}
@property --_sw-x-start {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}

/* The keyframes that deliver their values. */
@keyframes --_sw-x-end {
  0%   { --_sw-x-end: 0 }
  100% { --_sw-x-end: 1 }
}
@keyframes --_sw-x-start {
  0%   { --_sw-x-start: 0 }
  100% { --_sw-x-start: 1 }
}
```
</details>

#### Simple Case

Let’s look at the case from [“The Problem”](#the-problem) section again:

<figure class="simple-example example-resizer">
<h5>I am a Longer Header; I Will Wrap & Look Bad! <span style="display: var(--initial-at-large, none)">Oh no! What Can We Do?</span></h5>
</figure>

And now, let’s apply our base technique to it:

{{<Partial src="examples/01-simple-1.html" class="require-timeline-scope example-resizer simple-example simple-example-fixed" screenshot="true" video="true" offset="0.25" span="2">}}
Resizing this example can show how things will behave with different wrap opportunities.
{{</Partial>}}

It works! But how did we achieve this?

Here is the HTML[^and-css] needed for the technique. Instead of just one element, we need to have a pretty specific[^specific-h5] nested structure:

{{<Sidenotes span="2">}}

  [^and-css]: All the CSS that we had to add for this specific example is `--sw-padding: var(--inline-padding)` — I will explain this in the [base technique’s CSS API](#base-techniques-api) later.

  [^specific-h5]: Obviously, the `h5` here is just for this example; otherwise it could be a `p`, `span`, or anything else that fits your use case. <!-- offset="1" -->

{{</Sidenotes>}}


```HTML
<h5 class="shrinkwrap">
  <span class="shrinkwrap-content">
    <span class="shrinkwrap-source">
      <!-- Text -->
    </span>
    <span class="shrinkwrap-probe"></span>
  </span>
</h5>
```

- <dfn>`shrinkwrap`</dfn> is our topmost wrapper element — one that will receive the final dimensions.
- <dfn>`shrinkwrap-content`</dfn> is the inner wrapper that usually will be wider than its parent and will determine how the text content inside will wrap.
- <dfn>`shrinkwrap-source`</dfn> is the additional wrapper around our _inline_ content, which we will target with anchor positioning.
- <dfn>`shrinkwrap-probe`</dfn> is our anchored element that will measure the `shrinkwrap-source` and which will communicate its dimensions to the `shrinkwrap` via scroll-driven animations.

The core idea is relatively simple. To steal[^metaphor] a [Doctor Who](https://en.wikipedia.org/wiki/Doctor_Who) metaphor from [Amelia Bellamy-Royds](https://front-end.social/@AmeliaBR):

[^metaphor]: [Source thread on Mastodon](https://front-end.social/@AmeliaBR/115554748276038848). <!-- span="2" -->

> We want a box that is bigger on the inside than out.

That’s precisely what we’re doing with our technique.

If you read [my previous article on this topic](/shrinkwrap-problem/), you might wonder, wouldn’t that previous technique that involved just anchor positioning be enough?

The problem with that older technique was that it would only position the anchored element around our inline element — and this would not impact the actual element’s dimensions or position in any way, making the setup pretty awkward.

For example, we would not be able to make the text inside this header be still left-aligned while centering the header itself:

{{<Partial id="01-simple-1-2" src="examples/01-simple-1.html" video_src="examples/01-simple-2.mp4" poster="examples/01-simple-2.jpg" class="require-timeline-scope example-resizer simple-example simple-example-fixed simple-example-aligned" screenshot="true" video="true" offset="0.25" span="3">}}
This example uses the new technique, so it is correctly centered, with the text inside being left-aligned. You could see a deliberately broken example in the [“Non-Left Text Alignment”](#non-left-text-alignment) section.
{{</Partial>}}

The new technique gave the parent `shrinkwrap` element the correct dimensions, making it possible to continue using CSS as usual, without trying to “fake” its visuals through an external anchored element.

I will omit explaining some styles and will trim various calculations — you can find them in the full code, but in these sections I want to give the general overview of the code involved in the technique.

##### Styles for the Top Wrapper

{{<Partial src="examples/01-simple-exploded-1.html" class="require-timeline-scope example-resizer simple-example simple-example-fixed" screenshot="true" video="true" offset="0.25">}}
This is the first time I am doing these “exploded” illustrations — I am bad at 3D in CSS, so I am sorry if they’re junky!

You can toggle some options inside this and the following examples to get a better idea of what is going on inside.
{{</Partial>}}

Our top `shrinkwrap` wrapper has a few important parts[^skipping-details] in its CSS:

[^skipping-details]: As mentioned before, I am skipping the exact styles inside — you can consult the [full code](#full-code) if you want to read through them, but I will focus on the wider picture in my explanations. <!-- span="2" -->

```CSS
.shrinkwrap {
  /* 1. Setting up overrideable custom properties. */
  @layer defaults {/*…*/}

  /* 2. Base styles: some other values are allowed. */
  display:  block;
  overflow: hidden;

  /* 3. Scroll-driven animations for remote measuring. */
  timeline-scope:     /* One timeline   */;
  animation:          /* Two animations */;
  animation-range:    /* Two ranges     */;
  animation-timeline: /* One timeline   */;

  /* 4. Applying the measured dimensions to the element. */
  inline-size:     /* Cyclic-toggled value. */;
  min-inline-size: max(/*…*/);

  /* 5. Some important resets. */
  box-sizing: content-box !important;
  flex-grow:  0 !important;
  flex-shrink:     /* Cyclic-toggled value */;
  max-inline-size: /* Cyclic-toggled value */;
}
```

1. We use layers and custom properties for defining the [CSS API](#base-techniques-api) of our technique.

2. Our topmost element should have a normal flow: `block` or `inline-block` will work, as well as it being inside a flex or grid context, but the element _itself_ can’t establish a grid or flex.

3. The key part: we use scroll-driven animations to retrieve the dimensions of our inner element. I will expand on this a bit more in a later [“Remote Dimensions Measuring”](#remote-dimension-measuring) section.

4. Second key part: applying[^cyclic-toggles] the measured dimensions to our element. The `inline-size` and `min-inline-size` will be calculated based on variables that will be applied via scroll-driven animations.

5. I also included a few properties that we should never really change for our parent element, as we are sizing it in a very specific way. This part might be adjusted: we could add more properties there or find use cases in which these properties could play a role and require overriding.

[^cyclic-toggles]: Here and in other places, I am using my [“Cyclic Dependency Space Toggles”](/cyclic-toggles/) technique for applying some styles conditionally, mostly to be able to have a more graceful fallback when the required CSS features are not supported. <!-- offset="8" span="2" -->

##### Styles for the Content Wrapper

{{<Partial src="examples/01-simple-exploded-2.html" class="require-timeline-scope example-resizer simple-example simple-example-fixed" screenshot="true" video="true" offset="0.25">}}
We can see how the `shrinkwrap-content` goes beyond the parent’s box, and if we resize this example, we could see how it is this element that directs how the text inside wraps.
{{</Partial>}}

The `shrinkwrap-content` is that “inner box” that might be bigger than the actual `shrinkwrap` element[^text-alignment-later].

[^text-alignment-later]: I omitted some styles that will make more sense in [the later section](#non-left-text-alignment). <!-- offset="1" span="2" -->

```CSS
.shrinkwrap-content {
  /* 1. Base styles. */
  display:  block;
  overflow: hidden;

  /* 2. Inner box’ dimensions. */
  inline-size:     /*…*/;
  min-inline-size: min-content;
}
```

The styles for the inner box are (for now) simple:

1. We need to have some base styles — again, we need to make sure we use a normal flow, and specifically `overflow: hidden`, as scroll-driven animations will rely on its presence on this element.

2. We have to set the dimensions of our element in a pretty specific way. It will reuse several “private” custom properties that we set on the wrapper and which are based on the custom properties defined by our technique’s API. The `inline-size` here is the most important part: the way we size it (by default with `100cqi`) makes it so it is independent of the `shrinkwrap`’s dimensions.

##### Styles for the Source

The `shrinkwrap-source` is[^same-illustration] one of the more simple elements:

[^same-illustration]: This element wraps the inline content. I omit an illustration for it, as it will be essentially the same as the one in the next section, and this section is short! <!-- span="2" -->

```CSS
.shrinkwrap-source {
  anchor-name: var(/*…*/);

  @layer defaults {
    display: inline;
  }
}
```

This element will provide the `anchor-name` used for our technique, which might be reassigned via the custom properties API.

Then, we _need_ it to be _inline_ by default, as this is what we rely on when measuring our element. However, there are use cases where we are not measuring _inline_ elements, so we apply this style weakly and allow overriding externally.

##### Styles for the Probe

Finally, we have our `shrinkwrap-probe` element:

{{<Partial src="examples/01-simple-exploded-3.html" class="require-timeline-scope example-resizer simple-example simple-example-fixed" screenshot="true" video="true" offset="0.25">}}
This element is anchored to cover the `shrinkwrap-source`’s area by default and will then communicate its dimensions to the `shrinkwrap`.
{{</Partial>}}

```CSS
@supports (timeline-scope: --f) {
  .shrinkwrap-probe {
    /* 1. Base styles. */
    position:       absolute;
    pointer-events: none;

    /* 2. Anchoring to the Source. */
    position-anchor: var(/*…*/);
    inset-block:     0;
    inset-inline:    calc(/*…*/);
    margin:          calc(/*…*/);

    /* Establishing the view timeline. */
    view-timeline: /*…*/;
  }
}
```

1. This is our absolutely positioned[^better-not-fixed] element that will measure the source element. We should remove the `pointer-events` from it, as it should not interfere with our page in any way. An alternative could be to use `visibility: hidden`, but I find it is much easier to keep it “visible” with just `pointer-events` for easier debugging.

2. We then anchor this element to the `shrinkwrap-source`. Later techniques might override some of these, but by default we only care about the `inset-inline` and use anchor positioning for defining it. Additionally, we’re using a `margin` to optionally adjust the measured rectangle.

3. Finally, we need to establish an `inline` view timeline, which will mean we could access it on the `shrinkwrap` element via `timeline-scope` and its `animation` properties.

[^better-not-fixed]: I also tried using `position: fixed` here, but it was not as stable as `absolute`, especially in Safari and Firefox. While `fixed` anchor positioning can be pretty useful, it is better to keep things `absolute` whenever possible and rely solely on `fixed` if nothing else helps.<br/> See my [“Anchoring to a Containing Block”](https://blog.kizu.dev/anchoring-to-a-containing-block/) blog post for a few more details.

Note that we can also wrap this whole element with an `@supports` — no reason to do anything with it unless `timeline-scope` is supported.

#### Non-Left Text Alignment

The above styles would be enough for cases when we have just a left-aligned text, as our `shrinkwrap-source`’s left boundary will be the same, and that would be enough to just shrink the `shrinkwrap` element.

However, if we were to override the `text-align` on our element, the following could happen:

{{<Partial src="examples/02-alignment-broken.html" class="require-timeline-scope example-resizer simple-example simple-example-fixed alignment-broken" screenshot="true" video="true" offset="0.25">}}
The code behind this example still uses the working technique; I have just overridden the crucial part that applies the fix for this behavior.

We can see how the outer wrapper is correctly sized, but because the text is rendered and aligned _inside_ that wrapper, we have to do something about it.
{{</Partial>}}

Because our inner box is bigger than the outer, and the text is aligned _inside that box_, it is not enough to shrink the outer one — we need to also detect[^or-realign] that offset between the `shrinkwrap-content` and `shrinkwrap-source`.

[^or-realign]: Alternatively, if we knew the alignment in advance, we could’ve changed the `justify-self` on the `shrinkwrap-content`, but I decided to go with an automatic adjustment. <!-- offset="2" span="2" -->

Thankfully, with [the way we’re measuring our element](#remote-dimension-measuring), we can reuse the variables that our scroll-driven animation applies and adjust the position of our `shrinkwrap-content`:

```CSS
/* Added to the other styles */
.shrinkwrap-content {
  position: relative;

  @supports (timeline-scope: --f) {
    inset-inline-start: min(/*…*/);
  }
}
```

We make[^always-relative] our element `position: relative`, and then use `inset-inline-start` to adjust its position.

[^always-relative]: I placed the `position: relative` to be always there regardless of the timeline support, as this property can have an impact on the element’s contents, and we would not want to lose it for the fallback case. <!-- offset="-3.85" -->

{{<Partial src="examples/02-alignment-fixed.html" class="require-timeline-scope example-resizer simple-example simple-example-fixed" screenshot="true" video="true" offset="0.25" span="2">}}
Changing the <code><label class="Link Link_pseudo" for="text-align-inputs">text-align</label></code> in this example shows how the `.shrinkwrap-content` moves.

Interestingly, Safari renders the text pretty differently compared to when the text is not aligned/transformed: if we look at the first line in this example, toggling the `text-align` will not make it change at all in Chrome, while there will be significant differences in Safari.
{{</Partial>}}

I imagine there could be other text edge cases that the base technique does not cover — if you’ll think of anything, please let me know!

#### Multiple Nested Phrasing Contents

While the base technique is limited to only shrinkwrapping elements with phrasing content, more complicated cases could be covered by reusing the technique multiple times for every instance of such content inside.

For example, we could have a list with several items, and then we’d want to put it into a card with its edges flush with the content of all items inside. For this, we can make our list the container and then wrap the contents of each list item with the technique and then size the card with `max-content` — and it will just work! And if some list items have multiple paragraphs, we use the technique once per paragraph.

{{<Partial src="examples/02-multiple.html" class="require-timeline-scope example-resizer" screenshot="true" video="true" offset="0.25">}}
<label class="Link Link--pseudo" for="multiple-disable">Disable the shrinkwrap fix</label> to see the difference. Resizing this example will also show how our element can take up to 50% of space based on how it wraps, but it will yield the remaining space to the nearby column.
{{</Partial>}}

In short, we can use our base technique as a building block for anything that is more complex. The later sections expand on this base technique but adjust how we measure things and what exactly we are measuring.

#### Base Technique’s API

The HTML of the technique is a part of its API:

```HTML
<div class="shrinkwrap">
  <div class="shrinkwrap-content">
    <span class="shrinkwrap-source">
      <!-- Text -->
    </span>
    <span class="shrinkwrap-probe"></span>
  </div>
</div>
```

- The `shrinkwrap` and the `shrinkwrap-content` can be anything apart from the `div`, but they can only have the `display: block` (which is applied by the technique but should not be overridden).

- The `shrinkwrap-source` defines what we will be measuring, and by default has `display: inline`. It is possible to apply it to some other element or skip this element completely if we’re overriding what we’re targeting with the `shrinkwrap-probe`.

- The `shrinkwrap-probe` is our measuring element, it must be strictly inside the `shrinkwrap-content`, and by default is measuring the `shrinkwrap-source`. We can override what the `shrinkwrap-probe` is measuring by overriding its `inset`.

Alongside HTML, we can define a set of CSS custom properties on the `shrinkwrap` element:

1. <dfn>`--sw-limit`</dfn> — the key custom property that has the default of `100cqi`. We can use it when we want to place some other elements alongside ours on the same “row”. The above [“Multiple Nested Phrasing Contents”](#multiple-nested-phrasing-contents) use one such case, where we set it to, essentially, `50cqi - 3 * var(--gap) - var(--list-item-padding)` — defining the max[^no-min-limit] limit that the text inside could take to be a half of the container, minus all the paddings and gaps that the surrounding layout has.

2. <dfn>`--sw-padding`</dfn> can be used when we have a uniform padding around the element that we’re sizing. We are in a something similar to the `box-sizing: content-box` context when we’re using this technique, so we can use this custom property to communicate the possible adjustment. It is similar to using a `calc()` inside a `--sw-limit`, and often is a more simple way of handling the paddings, but more complex cases might be better solved with the calculated `--sw-limit`.

3. <dfn>`--sw-inner-padding`</dfn> is a bit different, and might be mostly used for more complex cases that involve `--sw-inset` or `--sw-source` overrides. This is a custom property to account for any padding that could be present _between_ the `shrinkwrap` and the measured content inside the `shrinkwrap-content`.

4. <dfn>`--sw-inset`</dfn> can be used to override the value of the `shrinkwrap-probe`’s `inset`, making it possible to anchor it to multiple elements for more complex cases like the [“Multiple Explicit Anchors”](#multiple-explicit-anchors). This is where the `--sw-inner-padding` can also be useful, as it will be automatically used for calculations that can be trickier to achieve with the `inset` shorthand. **Note: ** this custom property is used specifically for `inset-inline` property, and not `inset`.

5. <dfn>`--sw-source`</dfn> is for those rare cases where you’d want to override the `anchor-name` of the `shrinkwrap-probe` element. This can be useful for any complex techniques where the measured element lives _outside_ the `shrinkwrap` element, allowing us to “link” them. See my [“Inline Custom Identifiers”](https://blog.kizu.dev/inline-custom-identifiers/) blog post that covers this way of connecting elements.

[^no-min-limit]: Initially, I wanted to also introduce a custom property for the “minimum limit”, but ended up simplifying the api. If necessary, it is always possible to do a `max(min-limit, limit)` for the same effect. <!-- offset="5" -->

### Remote Dimension Measuring

I am using a technique, the basics of which I came up with somewhere in 2023, after publishing [my second article about scroll-driven animations](/position-driven-styles/). I did not write about this technique anywhere yet, but had a few drafts with various use cases for it that I sometimes worked on in background.

Thankfully, someone else came up with a similar technique and wrote about it — it was [Temani Afif](https://css-articles.com/) and his [“How to Get the Width/Height of Any Element in Only CSS”](https://frontendmasters.com/blog/how-to-get-the-width-height-of-any-element-in-only-css/) article from July 2024.

There is one difference between our techniques: Temani relies on the “measuring” element when it is at the beginning of the box, and then using its `1px` dimension and its proportions relative to the scrollport to calculate that scrollport’s dimensions.

Because I am using anchor positioning to place my probing element at a very specific point — which I want to measure — I, instead, rely on a very high value of the `timeline-range`, which I store in the `--resolution` custom property.

When some view timeline then reports its position in this range, by knowing this “resolution” we can then retrieve that position through scoping the timeline to another element.

Here is the CSS[^snippets-from-full] responsible for the scroll-driven animations that I previously skimmed through:

[^snippets-from-full]: This is only the scroll-driven animations related code copied and pasted from the [full code](#full-code) of the technique, with the comments intact. These comments should give you some notion of what’s going on if you would like to understand it, but as I will also write below — I intend to write a separate article about this measurement method and its properties, and once I do — I will link to it from here. <!-- span="2" -->

```CSS
.shrinkwrap {
  /* Lifting the scope of view timelines from inside. */
  timeline-scope: --_sw-x;

  /*
    Accessing the start and end coordinates of the
    inner element via scroll-driven animations.
    Only apply when the technique is enabled.
  */
  animation: var(--sw-enabled--on,
    --_sw-x-start linear both,
    --_sw-x-end   linear both
  );

  /*
    We will be using the “resolution” as a range to
    retrieve the width of various things.
  */
  --_sw-resolution: 10000px;
  animation-range:
    0               var(--_sw-resolution),
    contain contain var(--_sw-resolution);
  animation-timeline: --_sw-x;

  /*
    Calculating the actual size from the variables applied
    via the animation with the given resolution.
  */
  --_sw-size:
    (var(--_sw-x-start) - var(--_sw-x-end))
    *
    var(--_sw-resolution)
  ;
  /*
    For the main size, clamp the result within limits,
    and guard everything with a space toggle.
  */
  inline-size: var(--sw-enabled--on,
    clamp(
      0px,
      var(--_sw-size),
      var(--_sw-max-size)
    )
  );
  /* Min-size should not be clamped. */
  min-inline-size: max(
    0px,
    var(--_sw-size)
  );
}

.shrinkwrap-content {
  @supports (timeline-scope: --f) {
    /* Guard by the cyclic toggle. */
    inset-inline-start: var(--sw-enabled--on,
      min(
        0px,
        var(--_sw-x-start) * var(--_sw-resolution)
        -
        var(--_sw-max-size)
      )
    );
  }
}

@supports (timeline-scope: --f) {
  .shrinkwrap-probe {
    /* Exposes the element to the scope on an ancestor. */
    view-timeline: --_sw-x inline;
  }
}

/*
  Custom properties that will be applied via scroll-driven
  animations, with the value from 0 to 1.
*/
@property --_sw-x-end {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}
@property --_sw-x-start {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}

/* The keyframes that deliver their values. */
@keyframes --_sw-x-end {
  0%   { --_sw-x-end: 0 }
  100% { --_sw-x-end: 1 }
}
@keyframes --_sw-x-start {
  0%   { --_sw-x-start: 0 }
  100% { --_sw-x-start: 1 }
}
```

I am planning to write a separate article that will explain how this dimension measuring works in detail, and I would rather not repeat myself in this one (and make it even longer).

So — stay tuned for that next article!

### A Crashing Safari Bug

As mentioned in the [disclaimer](#disclaimer), this technique is very experimental, and the CSS features it relies on are pretty new, and can sometimes cause issues even though they’re there in the “stable” versions of major browsers.

Initially, I was creating the probing elements as pseudo-elements, but while testing my article, I found that in certain conditions my article was [crashing its tab in Safari](https://bugs.webkit.org/show_bug.cgi?id=302703).

After reducing the code to its minimal reproduction[^reduce-reproduce-report], I found that the probing element being a pseudo-element was one of the conditions for the crash to happen, so I adjusted the technique by replacing it with a real element.

[^reduce-reproduce-report]: I wrote a blog post about this: [“Minimal Reproductions”](https://blog.kizu.dev/minimal-reproductions/), in which I share all the reasons to do so when reporting bugs. <!-- span="2" -->

Initially, my technique also had another pseudo-element that did not trigger the issue, but I managed to simplify my technique to allow doing both measurements from the single additional element.

### Solving for Complex Content

The base technique works for the simple case where our source element has phrasing content: only `inline` (and `inline-…`) elements inside.

But what about more complex cases, like when we have multiple items inside wrapping flexbox, grids, etc?

The simpler cases which we could separate into several independent phrasing contexts can be solved by repeating the base technique — see [“Multiple Nested Phrasing Contents”](#multiple-nested-phrasing-contents), but not everything can be done this way.

#### Multiple Explicit Anchors

I covered this use case and a few of my approaches to a solution in my previous article, in a [“Wrapping Flex Items”](/shrinkwrap-problem/#wrapping-flex-items) section, but the new technique improves on those.

In short, if we have a wrapping list of items, either inside a grid or a flex container, if we know the number of items, then we can assign a unique anchor to every item and then use a `min()` function involving _all the anchors_ to find the “furthest” element that could be used to determine our shrinkwrapped dimension.

{{<Partial src="examples/03-items-explicit.html" class="require-timeline-scope example-resizer" screenshot="true" video="true" offset="0.25">}}
We can shrink the container with our list to be flush with its items on both sides, regardless of how we justify the content inside.

Similar to how with `text-wrap: balance`, `flex-wrap: balance` that we will have soon will also make these types of issues more prominent with the flexbox layouts.
{{</Partial>}}

Because I abstracted the measuring into a separate element, implementing this is as easy as doing the following[^infinity-fallback] (after stripping visual styles unrelated to the technique):

[^infinity-fallback]: We have to fall back to `calc(infinity * 1px)`, as otherwise things could break if one or more items won’t be in the DOM.<br/><br/> Adding `infinity` inside a `min()` will gracefully remove this item from being considered for the calculation completely. <!-- span="2" offset="1" -->

```CSS
li {
  padding:     var(--padding);
  anchor-name: var(--is);
}

.shrinkwrap {
  --sw-inner-padding: var(--padding);
  --sw-inset:
    min(
      anchor(--a inside, calc(infinity * 1px)),
      anchor(--b inside, calc(infinity * 1px)),
      anchor(--c inside, calc(infinity * 1px)),
      anchor(--d inside, calc(infinity * 1px)),
      anchor(--e inside, calc(infinity * 1px)),
      anchor(--f inside, calc(infinity * 1px)),
      anchor(--g inside, calc(infinity * 1px))
    )
  ;
}
```

And the HTML is pretty simple: we wrap our list with our shrinkwrap technique:

```HTML
<div class="shrinkwrap">
  <div class="shrinkwrap-content">
    <ul>
      <li style="--is: --a">
        An item
      </li>
      <!-- the rest of the items  -->
    </ul>
    <span class="shrinkwrap-probe"></span>
  </div>
</div>
```

Because what we’re measuring is not _inline_, we are not using the `shrinkwrap-source` class that would assign the target that we measure; that’s where the `--sw-inset` custom property comes into play: we can use it to reassign how the `shrinkwrap-probe` will be positioned by overriding its `inset` property, and thus what exactly it will measure.

The only thing that we need to do here is use the `min()` function and pass all items’ anchors inside, making it possible to compare the inset positions of all the items and choose those that make the biggest bounding box.

In addition to this, we can use the `--sw-inline-padding` to accommodate the padding around items, which, in this case, is much easier to do than adding a calculation to the `min()`.

#### Chained Anchors Abomination

Of course, the above code relies on knowing the number of elements, assigning the unique anchor identifiers to them, and then listing all of them inside a `min()`. But what if I tell you that we could achieve this without doing so?

Well, we can, but, for now, this works only in Chrome — this relies on the ability to _chain multiple anchors together_, and that currently only works reliably in Chrome, while Safari and Firefox have pretty serious bugs[^chained-bugs] with that behavior.

[^chained bugs]: [Safari bug](https://bugs.webkit.org/show_bug.cgi?id=301919), and [Firefox bug](https://bugzilla.mozilla.org/show_bug.cgi?id=2005455) — thanks to [Nicolas Chevobbe](https://nicolaschevobbe.com/) for [reporting it](https://mastodon.social/@nicolaschevobbe/115700395235230603)! <!-- offset="1.6125" -->

{{<Partial src="examples/04-items-any-count.html" class="require-timeline-scope example-resizer example-any-count" screenshot="true" video="true" offset="0.25" span="2">}}
I limited the number of items in this list to be 99 — with this particular setup, things work well even with 10000 elements, mostly because at some point there won’t be any elements that are furthest to the left or right of others, so the actual chain stops early. If we were to fully chain elements one after another, Chrome would start to show long tasks for me after 100 elements, and took 17 seconds to render 1000.
{{</Partial>}}

This time, HTML is a bit more simple in one way (no unique idents), but more complex in another (additional probe elements, two per item):

```HTML
  <div class="shrinkwrap">
    <div class="shrinkwrap-content">
      <ol>
        <li>
          An item
          <div class="probe-left"></div>
          <div class="probe-right"></div>
        </li>
        <!-- the rest of the elements  -->
      </ol>
      <div class="shrinkwrap-probe"></div>
    </div>
  </div>
</div>
```

You can see how, alongside the `shrinkwrap-probe` element, each element has its two `probe-left` and `probe-right` elements.

But how, without a `min()`, can we use this to measure the bounding box for all elements without explicitly mentioning them?

Here is the CSS[^non-logical] responsible for this:

[^non-logical]: I am using physical keywords here instead of logical ones, mostly for brevity and to make it easier to understand. <!-- span="2" -->

```CSS
li {
  anchor-name:  --li;
  anchor-scope: --li;
}

.probe-left,
.probe-right {
  position:       absolute;
  pointer-events: none;
  inset:          anchor(--li inside);
  container-type: inline-size;

  &::before {
    content:  "";
    position: absolute;
    inset:    0;
  }
}

.probe-left {
  left:  anchor(--li left, 0);
  right: anchor(--leftmost left, anchor(--li right));

  @container (min-width: 1px) {
    &::before {
      anchor-name: --leftmost;
    }
  }
}

.probe-right {
  left:  anchor(--rightmost right, anchor(--li left));
  right: anchor(--li right, 0);

  @container (min-width: 1px) {
    &::before {
      anchor-name: --rightmost;
    }
  }
}

.shrinkwrap {
  --sw-inner-padding: 1em
  --sw-inset:
    anchor(--leftmost  left)
    anchor(--rightmost right)
  ;
}
```

Starting from the end — as we don’t have a `shrinkwrap-source`, we override `--sw-inset` to get the insets from the leftmost and rightmost items, which will be determined later.

Then, we can assign a scoped anchor name to our items:

```CSS
li {
  anchor-name:  --li;
  anchor-scope: --li;
}
```

We need to _scope_ it so the probe elements inside the items would see the correct anchors; otherwise, they could look up at the last one they see.

What we do next is pretty fun: we use this parent `<li>` as the anchor for the nested probes via `inset: anchor(--li inside)` on them and also make these probes _inline containers_ via `container-type: inline-size`, which makes it possible to query them on inner pseudo-elements.

Then, we do this for the probe that measures the right edge of our boundary box (and mirror it for the `probe-left`):

```CSS
.probe-right {
  left:  anchor(--rightmost right, anchor(--li left));
  right: anchor(--li right, 0);

  @container (min-width: 1px) {
    &::before {
      anchor-name: --rightmost;
    }
  }
}
```

We rely on an ability to “chain” the anchors[^chaining]: anchor to the _previous_ valid anchor target among multiple that share the name. Then we can use container queries to check if our probe has a positive width — that would mean that its edge is to the _right_ from the previous rightmost probe.

[^chaining]: Interestingly, this was not something that was easily possible initially and was [brought up to CSSWG](https://github.com/w3c/csswg-drafts/issues/8165) by [Xiaocheng Hu](https://github.com/xiaochengh) in an issue [I also contributed my feedback](https://github.com/w3c/csswg-drafts/issues/8165#issuecomment-1469912952) to as a result of working on my first anchor positioning article. <!-- span="2" -->

In a way, this is an algorithm for determining the maximum value of something expressed via pure layout — anchor positioning and container queries! It relies on the order the elements are laid out: the later elements can anchor to earlier elements, so they can use the dynamic anchor names that are applied inside container queries.

If it is difficult to understand what is going on, highlighting those `probe-left` and `probe-right` elements could help:

{{<Partial id="any-count-visual" src="examples/04-items-any-count.html" video_src="examples/04-items-any-count-visual.mp4" poster="examples/04-items-any-count-visual.jpg" class="require-timeline-scope example-resizer example-any-count" screenshot="true" video="true" offset="0.25" span="3" style="--overlays: var(--overlays--on)">}}

The probing elements have diagonal lines in different direction: blue ones on the left, green ones on the right. Those have positive widths and enabled container queried styles.

The red lines are probes with zero dimensions, and those do not match the container query.

Resizing the example and changing the number of items inside can help with understanding what’s going on.

{{</Partial>}}

Going with elements one by one, we position both probes on both sides, each going from the edge of the last pseudo-element that was placed into a positive container query or falling back to the first element’s dimensions. This makes it so, going through all elements, we will create “steps” out of our probes, where only the rightmost and leftmost ones will have positive dimensions.

Too bad Safari and Firefox don’t work well with chaining just yet…

### Cross-Dependencies: Menu Use Case

The final and the hardest use case I want to cover is something like a navigation menu, in which all elements should participate in a single flex context, and with these elements shrinking if there is not enough space for them.

If we take some horizontal menu with just a few shorter items, then everything looks fine when all items fit in:

{{<Partial src="examples/05-menu-intro-a.html" style="width: max-content; justify-self: center" />}}

But here is what happens when the items are longer, there are more of them, and not enough space to have them all without wrapping:

{{<Partial src="examples/05-menu-intro-b.html" class="example-resizer" offset="0.25" style="width: min(510px, 100cqi); justify-self: center" span="2">}}
The items wrap, and the gaps between them become an uneven mess of a whitespace.
{{</Partial>}}

At the core, this is the same issue as with the other shrinkwrap problems: once wrapped, the element tries to take as much space as it can, and when there are multiple elements fighting for that space, it will be re-distributed.

It would’ve been great if the base technique I presented above could work for that case. But it doesn’t: for the base technique to work, we have to know the _limits_ in which we’re working, but when our element depends on _all other elements_ and shrinks proportionally based on all the extra elements present around, we cannot[^cannot-achieve] achieve it with what we have for now.

[^cannot-achieve]: That said, I have _some_ ideas and made many experiments, but even though, occasionally, it seemed that I came close to solving it, there was always something preventing me from getting to the end. Usually, some kind of flickering infinite loop. Maybe one day! <!-- span="3" offset="4" -->

The only way to solve it that I found is with content duplication: first, we can render our menu as regular but hidden, measure the wrapped elements, and then transfer their dimensions to the visible copy, one by one.

The whole setup can then be placed inside another instance of our base technique, so we could collapse the whole menu and allow elements around it to stretch over the space that we gain.

Here is what it can look like when adding a few more elements to the example:

{{<Partial src="examples/05-menu.html" class="require-timeline-scope example-resizer" screenshot="true" video="true" offset="0.25" style="min-width: min(510px, 100cqi);" span="2">}}
Disabling the shrinkwrap on this example shows how useful it can be to free up all that space for other elements to take over: we not only make the gaps more pleasing to look at, but also give more room for other elements like search.
{{</Partial>}}

While I managed to make it work in this case, I found that there are more problems with these kinds of menus. If you resize it, on narrower screens, things become pretty bad. Some container queries and switching up the layout could work, and there are things that could be improved with this solution further.

I won’t provide a more detailed explanation of how this works and won’t show any code, at least for now: it is very fragile, and maybe once I play with this type of layout more, I could see a better way to apply my technique. Or come up with something else.

But what this demonstrates is that _the complex cases are complex_, and while it is possible to come closer to solving them, there are still many unknowns over how exactly they should be solved.

## Some Other Use Cases

Before I end the article, I don’t want it to stop on the sourer note with the previous not fully solved case. So, let’s return to some examples from [my last article on shrinkwrap](/shrinkwrap-problem/), and demonstrate how the new technique solves them much better. Plus, I’ll add another two use cases that I did not cover in my previous article.

### Chat Bubbles

One of my favorite examples is the chat bubbles — you can see this _everywhere_, from phone apps to video games. I imagine native frameworks have their ways of doing this, but on the web we could not achieve this look with just CSS until now.

{{<Partial src="examples/06-bubbles.html" class="require-timeline-scope example-resizer" screenshot="true" video="true" offset="0.25">}}

Compared to the [original bubbles example](/shrinkwrap-problem/#chat-bubbles), in this one we were able to keep the text alignment to the left, as our new technique accounts for it!

With the new technique in place, `text-wrap: balance`, finally, shines so much brighter! You can try <label class="Link Link--pseudo" for="bubbles-balance">disabling it</label>.

{{</Partial>}}

The implementation of this is so much simpler than what I had to do when trying to fake it by anchor-positioning the bubble’s background separately! Now we just give `max-width: max-content` to the blockquotes inside and then wrap each paragraph with our technique, like that:

```HTML
<blockquote>
  <p class="shrinkwrap">
    <span class="shrinkwrap-content">
      <span class="shrinkwrap-source">
        Hello, there!
      </span>
      <span class="shrinkwrap-probe"></span>
    </span>
  </p>
</blockquote>
```

And then the only extra CSS that we have to add is the definition of the `--sw-limit` and `--sw-padding`:

```CSS
.example-bubbles .shrinkwrap {
  --sw-padding: var(--padding-inline);
  --sw-limit: calc(
    100cqi
    -
    (
      var(--margin-start)
      +
      var(--margin-end)
    )
  );
}
```

We have to account for all the paddings and margins we can have and add `inline-size` containment on our example wrapper, but otherwise this shows how much easier it is to use.

### Fieldsets and Legends

In [the corresponding example](/shrinkwrap-problem/#legends) in my previous article on this topic, I relied on the legend expanding and then re-adding the borders, faking them via added pseudo-elements.

The below `legend` is using the new technique and doesn’t have any faked borders[^fake-legends]. It fully relies on the “magic” behavior of the native `fieldset` and `legend`:

[^fake-legends]: If you want to check out how to fake this today _outside_ `fieldset`, I recommend a recent article by [Tyler Sticka](https://tylersticka.com/) [“Faking a Fieldset-Legend”](https://cloudfour.com/thinks/faking-a-fieldset-legend/). It does not handle the wrapping case, but my technique could be easily used alongside Tyler’s code if needed! <!-- offset="-4.25" -->

{{<Partial src="examples/07-legends.html" class="require-timeline-scope example-resizer" screenshot="true" video="true" offset="0.25">}}

<label for="legend-shrinkwrap" class="Link Link--pseudo">Disabling shrinkwrap</label> will make the legend expand and making the border look very awkward in this example.

{{</Partial>}}

And, again, this example shows how `text-wrap: balance` could improve things, but only if we could shrinkwrap it natively.


### Overlay Image Captions

This use case wasn’t in my first post about shrinkwrap but was provided by [Johannes Odland](https://odland.dev/) to me in a private conversation, where he mentioned that they had cases like this at NRK.

Let’s say we want to have a figure with an image and want to put the caption on top of it with a semi-opaque background that is flush to the caption’s text so we could minimize the area it covers. As with other cases, when the text is short, everything is ok, but when it wraps, it will span all the available space. Shrinkwrapping will help with this a lot!


{{<Partial src="examples/08-figcaptions.html" class="require-timeline-scope example-resizer" screenshot="true" video="true" offset="0.25">}}
Once again, `text-wrap: balance` shows its usefulness here, and resizing the example will show how we can benefit from shrinkwrap at various sizes.

I guess, in this specific example, I could’ve just placed a `<br>` between its parts, which is the old hardcoded way of solving shrinkwrap issues, but it is great that my technique works without that.
{{</Partial>}}


### Tooltips

The last use case I’ll show in this article is one that we have in Datadog, and that is likely familiar to anyone dealing with design systems — tooltips and popovers. Pretty often you want the content in them to be nice and balanced, but have a certain limit, usually much smaller than the width of the viewport. Without shrinkwrapping, this can lead to rather ugly results. But our technique allows creating pretty and neat tooltips.

{{<Partial src="examples/09-tooltip.html" class="require-timeline-scope" screenshot="true" video="true" offset="0.25">}}

This is another where disabling either <label for="tooltip-shrinkwrap" class="Link Link--pseudo">shrinkwrap</label> or <label for="tooltip-balance" class="Link Link--pseudo">text-wrap: balance</label> will be very visible.

{{</Partial>}}

I wish the HTML for the technique was as pretty as the result — while all the demos above show how it _works_, it is hardly easily applicable for user-generated content, and even when you have full control over your HTML, it can be pretty cumbersome.

## What Next?

To me, it is clear that the most basic use cases — when we know the max-inline-size our element can take — should be achievable in browsers with either a new property or a new function that could be used for size properties. It might require containment or something similar, as there is still a chance the percentage-based dimensions could lead to some circularities. But even with the required containment, what this will allow us to achieve will cover so many things people wanted to do for more than a decade now.

I don’t think we need to pursue solving the menu case (cross-dependent shrinkwrapping) for now — it is a much, much more complicated layout. But I believe if we work out the simple cases first, we could crunch on those low-hanging fruits and see if we could make some more complex jams out of them later.

I will post a link to this article and my proposal to explore the simpler solution today[^ftf] in the [corresponding CSSWG issue](https://github.com/w3c/csswg-drafts/issues/191), and if you had stumbled upon this problem before and have any specific use cases, bring them up and maybe even see if my technique will cover them.

[^ftf]: This article will be published just before a CSS Working Group’s face-to-face meetings’ week, but I doubt we will look into shrinkwrap this time. Perhaps in a few months! <!-- span="2" offset="1" -->

And I will also be working on another article — one that will cover my method of [remote dimension measuring](#remote-dimension-measuring) technique, so stay tuned for that and more! Although, likely, it won’t be anywhere soon, as these articles take a long time to research and write.
