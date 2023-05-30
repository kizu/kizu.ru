# Future CSS: Wishes Granted by Scroll-driven Animations

#Scroll_Driven_Animations #Position_Sticky #Future_CSS #Experiment #CSS

_Stuck state for sticky headers? “Proper” solution for scrolling shadows? Highlighting the currently shown sections in a Table of Contents? All these things could become possible with the new scroll-driven animations spec. Today, I gather and explain some of my experiments with this new CSS feature._

## Introduction

I would be lying if I told you I completely understood the [specs for scroll-driven animations](https://www.w3.org/TR/scroll-animations-1/). I didn’t even read them thoroughly! However, when thinking about them, I did imagine some ways we could potentially use them — and after some[^painful] experiments, I did succeed.

[^painful]: When a feature is available only behind a feature flag and only in Chrome Canary, things can change from version to version. I had to rework all my experiments a few times, following up with the changes in the implementation — the price we have to pay when dealing with the newest, shiniest things in CSS! <!-- offset="3" span="3" -->

Some of the things I would be talking about are present in multiple people’s CSS wish lists, usually right at the top. However, maybe not everyone did envision scroll-driven animations as the thing that could bring these use cases to life.

When I initially looked at this spec, from the top of my head, I could only think of various “promo” pages with elaborate scroll effects and galleries. Or, at least, most of the examples I saw in the wild did focus on these.

In this article, I would like to demonstrate some techniques beyond _effects_, which could, in time, find a home as a part of more generic UI components and design systems.

## Experiments

First, some important disclaimers:

- I would not go in-depth into how scroll-driven animations work. There are other resources[^resources] available where you could learn about them — and, as I mentioned in the beginning, I do not understand them enough to be able to distill their meaning in an understandable form.
- This article only talks about things that are not available in the current versions of the browsers — in fact, the only place my experiments work is the latest Chrome Canary[^version].
- This is still an experimental technology: both the specs and the implementation could change, breaking my use cases.
- As always — if you think I missed some disclaimers, let me know, and I would be happy to add them here!

{{<Sidenotes offset="1">}}

  [^resources]: For example, [“Scroll-driven Animations”](https://developer.chrome.com/articles/scroll-driven-animations/) article by [Bramus](https://www.bram.us/).

  [^version]: Tested in `116.0.5801.0` at the moment of publishing. <!-- offset="4.25" -->

{{</Sidenotes>}}

### Stuck States for the Sticky Headers

That is _the_ use case that excites me the most. The ability to detect when an element with `position: sticky` becomes stuck was requested[^requested] by developers for years and years. And I’m not an exception — I also wanted to have it from at least 2017. Is it possible that we no longer require a particular state and could instead use scroll-driven animations?

[^requested]: Recent wishlists: [1](https://ishadeed.com/article/css-wishlist-2023/#detect-when-sticky-is-active), [2](https://www.ellyloel.com/garden/css-wishlist-2023/#things-that-don-t-exist-yet), [3](https://blog.jim-nielsen.com/2023/css-wishlist/#ahmad-sticky-stuck), [4](https://thinkdobecreate.com/articles/css-wishlist-2023/#noted-in-other-wishlists). See also a [2017 issue](https://github.com/w3c/csswg-drafts/issues/1656). <!-- offset="1" -->

Let me start right away with an example[^grid]:

[^grid]: Credit for the pattern in the examples’ backgrounds — [Temani Afif](https://front-end.social/@css)'s [CSS Pattern](https://css-pattern.com/#g13). <!-- offset="-1.375" -->

{{<Partial src="examples/scroll-driven-animations-1-1.html" screenshot="true" video="true" style="padding: 0;" >}}
Scrolling through the example demonstrates how the sticky headers change when getting stuck.
{{</Partial>}}

This example is done with pure CSS. If you ever wanted to do something like this in production, you could remember the hoops we had to jump to make this possible. Listening to the scroll, measuring things, reserving space, using intersection observers, orchestrating animations and transitions…

Talking about animations — note how we’re not just getting a binary stuck/not-stuck state[^state-queries], but can define the _range_ over which the headers would become stuck!

{{<Sidenotes offset="1" span="3">}}

  [^state-query]: Which could be potentially possible in the future via [state-based container queries](https://github.com/w3c/csswg-drafts/issues/6402).
  [^omit]: I omit some unrelated to the scroll-driven animations code — feel free to look at the source for more context.

{{</Sidenotes>}}

How does it work? Initially[^omit], we need to set up the CSS variables that we would be using:


```CSS
.sticky {
  --height: 2em;
  --reduce-to: 0.5;
  --distance: calc(var(--height) * (1 - var(--reduce-to)));
}
```

1. We set up the total height of our header. We need to know it — this is the main limitation of our method.
2. We define the size[^size-proportion] we want to get after the header becomes “stuck”. We could skip this if we would like the size to be static.
3. We define a “distance” which we calculate based on our two previous variables. Note how in the demo, we have the bottom edge of our headers not change — the “distance” variable allows us to set the “duration” of the animation later in the `animation-range`.

[^size-proportion]: I’m defining the size as the proportion to the original height — this is useful for us to use the transforms for smoother animation, and we cannot yet remove units in calculations. <!-- offset="2" -->

With our variables set up, we are ready to begin working on the animations. For complex cases like the above example, I prefer to use children for this: if we’d set all the children to the same height, we could use the same values for the `animation-range`, which we can define as a variable on the parent element, so we can reused it later:

```CSS
--animation-range:
  entry 100cqh
  entry calc(100cqh + var(--distance));
```

A few things to note:

1. I’m using the [`entry` named timeline range](https://www.w3.org/TR/scroll-animations-1/#valdef-animation-timeline-range-entry) (we can think of it as when the element appears at the bottom of the screen when we scroll down), and because we want to do our thing when it would be at the top of the screen or scrollable container, we need to adjust it.
2. Which brings us to `100cqh` — we can use the container query length units instead of the viewport[^viewport-units] units so we could then have the same animation inside the scrollable containers (given we make them containers — which is usually simple enough).
3. We define the range by the `--distance` variable, making the animation go for its length.

[^viewport-units]: An open question would be: if we’d want to use the viewport units — would we want to use the [new variants](https://www.w3.org/TR/css-values-4/#viewport-variants) of these? That would require testing — which would work better for each use case. I’m planning to do research on them at a later date, but let me know if you’d find out this yourself! <!-- offset="6" span="3" -->

Now that we have our range variable in place, we can apply it to the elements that need a transition, alongside any animations that we would want to have:

```CSS
.sticky-text {
  /* other styles are omitted */
  animation: auto linear shrink-text both;
  animation-timeline: view();
  animation-range: var(--animation-range);
}
.sticky::before {
  /* other styles are omitted */
  animation: auto linear reveal-and-shrink-bg both;
  animation-timeline: view();
  animation-range: var(--animation-range);
}
```

Here we define our timeline[^timeline-bug] as `view ()`, our range to the variable, and set the animation. In our case, we have those two animations as such:

[^timeline-bug]: I also tried to set up the timeline on the parent element via `view-timeline-name`, but there seems to be a bug currently, and I also do not find it useful enough for this case anyway. <!-- span="2" -->

```CSS
  @keyframes shrink-text {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(var(--reduce-to));
    }
  }
  
  @keyframes reveal-and-shrink-bg {
    from {
      opacity: 0;
      transform: scaleY(1);
    }
    to {
      opacity: 1;
      transform: scaleY(var(--reduce-to));
    }
  }
```

Because we want the text to shrink in both dimensions (and be always visible) but the background to only shrink vertically (and gradually appear), we need to use animations on two different elements with different transforms. Note how we can use the variable for `--reduce-to`, and, in case we won’t need to reduce anything and would want to add the background and shadow, using the opacity and “revealing” the element that contains these seems like the most convenient way to set this up.

#### Joined Sticky Headers

Scroll-driven animations allow us to have something similar to the “bottom scroll margin”, where we could reserve space for the following header when we want to “join” two or more together.

Look at this example:

{{<Partial src="examples/scroll-driven-animations-1-2.html" screenshot="true" video="true" style="padding: 0;" >}}
Scrolling through the example demonstrates how the sticky headers combine when getting stuck.
{{</Partial>}}

Here we can not only make the headers properly stuck together even while resizing but also when the section ends: we can make the first header not go over the next one’s area (which usually happens with common sticky elements) — all thanks to another animation added to the sticky header itself that moves it to the appropriate distance when it _exits_ its area.

<details>
<summary class="Link Link_pseudo">Here is the complete CSS that overrides the styles of the previous example</summary>

```CSS
@keyframes translate-up {
  to {
    transform: translateY(
      calc(var(--distance) - var(--next-height, 0px))
    );
  }
}

.example-1-2 .sticky {
  top: var(--scroll-margin, 0px);
  --animation-range:
    entry calc(
      100cqh - var(--scroll-margin, 0px)
    )
    entry calc(
      100cqh - var(--scroll-margin, 0px) + var(--distance)
    );
  animation: auto linear translate-up;
  animation-timeline: view();
  animation-range:
    exit calc(var(--distance) - var(--next-height, 0px))
    exit 0;
}

.example-1-2 h4.sticky {
  --reduce-to: 0.5;
  --height: 3rem;
  --next-height: 1.5rem;
}

.example-1-2 h5.sticky {
  font-size: 0.75em;
  --reduce-to: 0.5;
  --height: 1.5rem;
  --scroll-margin: 1.5rem;
}
```

</details>

The main thing to note here is that we introduce two new variables, which need to be used on the headers to make them “know” about the previous/next ones, allowing them to adjust things properly:

- `--next-height` — the height of the next header that would get stuck in the same group, is used to fix the “exit” state.
- `--scroll-margin` — should be the current accumulated height[^scroll-margin] of previously stuck headers, used to attach the second header “below” the first one.

[^scroll-margin]: While we do not use it for this purpose in the example, we could also want to provide this value to everything following our headers as an actual [`scroll-margin`](https://drafts.csswg.org/css-scroll-snap/#scroll-margin). This way, if we could want to use anchors for navigation or scroll things programmatically, the content would be visible and won’t go below our sticky headers. <!-- offset="2" span="3" -->

* * *

There can be a lot of other cases for stuck headers and changing styles inside of them — and I find using scroll-driven animations a rather expressive way to do so. I wish we did not have to rely on the viewport or container height, but I couldn’t yet achieve this effect without these calculations. I am not entirely sure if the fault is at the specs or the implementation (or at me) — I would need to do slightly more research on this.

### “Proper” Scrolling Shadows

For my second example, I want to come back to one of my older experiments — [“Scrolling Shadows”](https://kizu.dev/shadowscroll/) (and[^css-secrets] [its improved version](https://lea.verou.me/2012/04/background-attachment-local/) by [Lea Verou](https://lea.verou.me/)). More than ten years did pass since then!

[^css-secrets]: Also mentioned in her [“CSS Secrets”](https://www.oreilly.com/library/view/css-secrets/9781449372736/) book — go buy it if you did not yet! <!-- offset="1" span="2" -->

Let me show you the demo first, and then I will talk about why I can call it a “proper” implementation this time.

{{<Partial src="examples/scroll-driven-animations-2-1.html" screenshot="true" video="true" >}}
Scrolling through the first container, we can see the shadows appear and disappear and go over complex background and foreground elements.
{{</Partial>}}

Implementation notes:

<details>
<summary class="Link Link_pseudo">CSS that is responsible for the shadows (unimportant bits omitted)</summary>

```CSS
@supports (animation-timeline: scroll()) {
  .example-2-1 .shadow {
    position: sticky; /* [1] */
    pointer-events: none;

    --height: min(5cqw, 0.75em); /* [2] */
    height: var(--height);

    opacity: 0; /* [3] */
    animation: auto linear to-opaque both;
    animation-timeline: scroll();  

    /* background omitted */
  }

  .example-2-1 .shadow--top {
    top: 0;
    margin-bottom: calc(-1 * var(--height));

    animation-range:
      contain 0px
      contain var(--height); /* [4] */
  }

  .example-2-1 .shadow--bottom {
    bottom: 0;
    margin-top: calc(-1 * var(--height));

    animation-range:
      contain calc(100% - var(--height))
      contain 100%; /* [5] */
    animation-direction: reverse; /* [6] */

    /* background omitted */
  }  
}

@keyframes to-opaque {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

</details>

1. We’re using two sticky elements[^not-pseudo]: one at the top and one at the bottom — this way, we can make them stay inside the scrollable box. We could potentially use an additional wrapper around our scrollable container and then absolutely position our shadows, but this would mean not having a relative position on our scrollable container. Also, could [anchor positioning](/anchor-positioning-experiments/) help us in the future?
2. We define our height[^not-logical-yet] as a CSS variable, so we could re-use it later for the negative margins (so the shadows don’t take up the space) and the `animation-range` (which is more important). As a bonus, we can use a `max ()` value, making the shadow less awkward for narrower containers.
3. We need to set the `opacity` to `0` by default and then have both stops in the keyframes — this allows us to hide the shadows when there is nothing to scroll.
4. We define the `animation-range` for the top shadow by using a [`contain` timeline range](https://www.w3.org/TR/scroll-animations-1/#valdef-animation-timeline-range-contain), spanning over the distance we want the transition to take over (in this case we’re using our `--height` variable, but we can use any other number based on our needs).
5. For the bottom shadow, we’re using a similar `animation-range` — also a `contain` one, but where we define it by subtracting our distance from the `100%`, as we want the animation to take place only in the end.
6. We use the `animation-direction: reverse; ` to reverse the animation for the bottom shadow — this makes the definition of the keyframes a bit more convenient.


{{<Sidenotes>}}

[^not-pseudo]: I’m using regular elements and not pseudo-elements as, in my testing, I found a few issues when using them instead. I’ll need to investigate this separately and will update the article if I’ll open a bug or would find a workaround for the issues I had.

[^not-logical-yet]: Note that in most of my examples, I’m using the physical properties. Ideally, we could want to use [the logical ones](https://www.w3.org/TR/css-logical-1/), in my experiments, I was going for the speed of convenience, and I must admit that I’m not used to the logical properties _yet_, so I’m not sure I could use them _properly_ each time. But yes, all the examples should be possible with logical properties instead.

{{</Sidenotes>}}

* * *

So, why is this a “proper” solution?

- Unlike the hacks with overlaying backgrounds, this time, our shadows can properly go above any elements in the content (granted, we won’t have issues with `z-index`).
- Similarly, we are free to use the shadows with any non-uniform or transparent background, as they now properly disappear instead of being overlayed by another solid background.
- Using the scroll-driven animations for this purpose just _feels right_, and seems simple enough. If we could describe what we want from the shadows, it would be something like “The top shadow should appear when we would start scrolling the container”, and “the bottom shadow should disappear when we would get to the end” — this is expressed quite literally with our `animations-range`s.

I’m really happy that with scroll-driven animations, wehave this use case covered, and this feels like an “on the nose” solution: I spotted at least one other developer — [Ryan Townsend](https://www.twnsnd.com/) — [talking about this usage for them on Mastodon](https://webperf.social/@ryantownsend/110343874125876334).

I can’t wait for this to be widely available! And, the best part — when using the `@supports`, we could add this as “progressive enhancement”. Though, as spoken in the disclaimers — I’d not recommend using this in prod until it becomes stable enough to land in the regular versions of the browsers.

### Table of Contents with Highlighted Current Sections

The final example I would like to show you today is the most experimental: it even uses[^attachment] another thing from the future — [anchor positioning](/anchor-positioning-experiments/).

[^attachment]: I _think_, ideally, we could use [`scroll-timeline-attachment`](https://www.w3.org/TR/scroll-animations-1/#scroll-timeline-attachment) to have the animations on our items deferred to the scrollable container. However, it seems not implemented in Chrome Canary yet, so I’m using the anchor positioning workaround. <!-- offset="1" span="3" -->

We often see _tables of contents_ on various blogs, documentation sites and design systems. One pattern in them is to mark the currently shown items in some way as “active”, letting the reader know where they are right now.

Usually, this is done by either listening to the scroll in JS and marking the locations of all sections or (more efficiently) by using an intersection observer.

What if we could do this just with CSS?

As a proof-of-concept, I did manage to achieve this with scroll-driven animations combined with anchor positioning. Let’s look at the example:

{{<Partial src="examples/scroll-driven-animations-3-1.html" screenshot="true" video="true" style="height: 12rem; padding: 0; overflow: hidden; resize: block;" >}}
Scrolling through the example, we can see the Table of Contents items being highlighted, mirroring the sections that are currently present in the viewport.
{{</Partial>}}

Overall, how it works:

1. We have to divide the content into sections, wrapping each in an element.
2. For each section, we establish a `view ()` timeline.
3. We use a `--state` CSS variable, with the default value of `0`, and then in the middle of the animation, set it to `1`. I found it a bit easier to handle the approximate moment when we want to change the state via controlling the keyframe stops rather than fiddling with the `animation-range`.
4. Now, we can use a pseudo-element somewhere in the section (I’m using it from inside the headers) to position them with anchor-positioning over their corresponding list items inside the table of contents.
5. Because we cannot style the list items themselves, but only the element positioned above them, we could want to be creative when styling them. In my example, I used `backdrop-filter` to my advantage — it feels that this could be a good tool when used with anchor-positioning in general.

Sadly, there is one issue with this approach: anchor positioning doesn’t work correctly with sticky positioning — when the element gets stuck, it does not get the proper scroll offset. That means we cannot use `overflow: auto` for the table of contents, thus making this less useful for larger pages.

There are some other aspects of this solution that I do not like or which I do not yet fully understand (well, they are mostly about the `animation-range` and how it applies), so I would not recommend even trying this method with graceful degradation (especially given it requires anchor positioning).

Let’s wait until things become more stable, but in the meantime, I think it is still quite fun to experiment with scroll-driven animations. And when we could test the `scroll-timeline-attachment`, maybe this example could become much less hacky and more usable!

## In Conclusion

It felt like I only did scratch the surface of what is possible with the scroll-driven animations, and there are so many more things possible[^demos]!

[^demos]: I highly recommend looking through the [scroll-driven-animations.style](https://scroll-driven-animations.style/) site — a collection of demos by [Bramus](https://www.bram.us/). <!-- offset="2" span="2" -->

I’m so happy with the future of what would be possible with CSS, especially when thinking about all the combinations of the new features we’re getting, like using all these animations with the anchor positioning, or recreating the very animated experience with just scroll-driven animations and view transitions. So many nice things!

Are there other curious cases you think scroll-driven animations could solve? I urge you to go and experiment!
