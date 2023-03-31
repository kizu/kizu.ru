# Contained Decorations

#Container_Queries #Practical #Experiment #CSS

_Did you ever want to detect when something wraps in a line? Or have a transition for unknown dimensions of an element? Or maybe style an element based on its content, but without losing the intrinsic dimensions of an element? Container queries, while powerful, require containment. But what if we would use absolutely positioned container, stretched over our original element? In this article I'm exploring how we can work around some of the container queries' limitations for a number of use-cases._

## The Technique

I'll start right away with the description of the base[^primer] technique itself — it is quite simple, and I'm probably not the first[^not-first] one to encounter it. Later in the article I would explain why we need it and present some use cases I thought of.

{{<Sidenotes span="3  ">}}
  [^primer]: If you’re new to the concept of container queries itself, I recommend first reading [“A Primer On CSS Container Queries”](https://www.smashingmagazine.com/2021/05/complete-guide-css-container-queries/) by [Stephanie Eckles](https://thinkdobecreate.com/).

  [^not-first]: Let me know if you did see it somewhere else — or if it was you who did write about it — I would be happy to link other articles here! <!-- offset="1" -->
{{</Sidenotes>}}

Be patient! I'll start with the code and the explanation of what is going on, as otherwise it could be hard to see what is special about most of the examples. You're free to [skip to them](#usage-examples) anyway, of course.
 
```HTML
<div class="some-element">
  <div class="some-element__decorations"></div>
  <!-- … -->
</div>
```

The thing worth mentioning right now is that we must use an actual additional element here — our techniques requires three elements nested one into another, so while we could use a pseudo-element, we would need to have an additional wrapper around it.

```CSS
.some-element {
  position: relative;
  z-index: 0;
  /* some styles */
}

.some-element__decorations {
  position: absolute;
  z-index: -1;
  inset: 0;
  container-type: size;
}

@container (/* queries */) {
  .some-element__decorations::before {
    /* Any styles for anything inside our container */
}
}
```

What's going on here:

1. We have an element with `position: relative` (and, while it is not _required_, it is better to set up the stacking context on it if we're planning to use z-index to handle things inside).
2. We add an absolutely-positioned element inside, which we define as our container.
3. Now, we can use container queries and container units for anything inside this element, without affecting the containment of our root element.

That's it!

### Why do We Need It

Container queries are incredibly powerful. However, they have one big limitation: in order to rely on our element's dimensions, we **have** to make it lose any connection with its children — they won't have any impact on our container's size (in one or both dimensions). That means that we couldn't use any intrinsic dimensions — any `min-content`, `max-content`, inside `flex`, `grid`, as an `inline-block`, and in numerous other cases.

This is an explicit limitation that exists as a way to prevent any potential circularity issues, and is a rephrasing of this part[^part] of [the specs](https://www.w3.org/TR/css-contain-2/#containment-size):

[^part]: I recommend reading the corresponding parts of the specs themselves — there are more nuances which you could find interesting. <!-- offset="1" span="2" -->

> The [intrinsic sizes](https://www.w3.org/TR/css-sizing-3/#intrinsic-size) of the [size containment box](https://www.w3.org/TR/css-contain-2/#size-containment-box) are determined as if the element had no content, following the same logic as when [sizing as if empty](https://www.w3.org/TR/css-contain-2/#sizing-as-if-empty).
> 
> > Note: This affects explicit invocations of the [min-content](https://www.w3.org/TR/css-sizing-3/#valdef-width-min-content) or [max-content](https://www.w3.org/TR/css-sizing-3/#valdef-width-max-content) keywords, as well as any calculation that depends on these measurement, such as sizing [grid tracks](https://www.w3.org/TR/css-grid-2/#grid-track) into which a size contained item is placed, or if [fit-content sizing](https://www.w3.org/TR/css-sizing-3/#fit-content-size) the containment box’s parent.

What we're essentially doing by making our absolutely positioned element a container — working around this limitation.

We're not constraining our actual element: it is still there, it could have any intrinsic sizes it wants. What we're doing is using its dimensions to create an additional _layer_ via an absolutely-positioned element that is stretched over it via an `inset` property[^inset]. And then, inside _this_ element we can do whatever we want with container queries.

[^inset]: If you're not familiar with it — it is just a logical shorthand alternative for `top`+`right`+`bottom`+`left`. Logical shorthands `inset-inline` and `inset-block` can be also quite useful! <!-- offset="3" span="2" -->

How cool is that! Of course, this is not the silver bullet — it just unlocks a few use cases that are not possible when we are applying the containment on the element in our usual flow.
 
### The Limitations

All our limitations come from the fact that our container queries could have an impact on only what is inside our absolutely positioned element:

- We cannot style the element itself, so we cannot use just a single pseudo-element for this — we need at least a parent + child combination, so, at minimum — an additional element + a pseudo.
- Obviously, we could only style what is inside our absolutely positioned element — we couldn't adjust the `font-size` or other attributes of our regular element, but what we could do is change its background, border, as well as some other curious aspects.

## Usage Examples

A lot of the use-cases for this technique are just a subset of the use-cases for container queries or media queries in general — we now unlock an ability to change some of the styles conditionally based on the context, with an addition of using these styles based on the _content_ as well, as now we're not losing the connection to it.

A simple way to demonstrate[^demonstrate] this could be to do something like this:

[^demonstrate]: I would provide a video for each example, so you could watch them in case you cannot resize the examples or the viewport on your device. <!-- offset="-3" -->

{{<Partial src="examples/contained-decorations-1.html" Zscreenshot="true" Zvideo="true" style="overflow: hidden; resize: horizontal; min-width: 16rem;">}}
{{</Partial>}}

The only thing that is different for these two items is their content, and the border and background styles are applied via container-queries. Resizing the example, we would see that when the item with longer content would become narrower, it would also get the same styles as the shorter one.

Here is the CSS that we added to the one I mentioned initially:

```CSS
.some-element {
  display: inline-block;
  padding: 0 1em;
}

.some-element__decorations::before {
  content: "";
  position: absolute;
  inset: 0;
  border: 2px solid hotpink;
  background: pink;
}

@container (width > 300px) {
  .some-element__decorations::before {
    border-color: pink;
    background: white;
  }
}
```

1. Our elements are now inline-blocks, so they shrink to content. This won't be possible if we would set the `container-type` on the elements themselves — they would then completely collapse.
2. We stretch the pseudo-elements to fill the element, and give it some default styles.
3. Now, we can use the container size to add the overrides inside a container query.

* * *

Of course, as we cannot really modify the inner layout, most of our use-cases would be for _decorative_ purposes. If I was a graphical designer, I could probably come up with a nicely-looking border-image that would change and adapt to the content, but alas.

That aside, I found some other interesting use-cases which I would love to share with you!

### Wrapping Detection

One of the first examples where I consciously applied that technique was to achieve what Ahmad Shadeed did describe in his [CSS Wishlist](https://ishadeed.com/article/css-wishlist-2023/):

> When I use `flex-wrap: wrap`, sometimes I wish there is a way to detect if the flex items are wrapped into a new line.
> 
> For example, say I have a section header that contains a title and a link. We can make this little component responsive with `flex-wrap: wrap`. The cherry on top will be to **know when the items wrap into a new line**.
> 
> I might need to add switch the position of a visual effect. For example, a border that is on the bottom by default, and is on the left when the times are wrapped.

{{<Partial src="examples/contained-decorations-2.html" Zscreenshot="true" Zvideo="true" style="overflow: hidden; resize: horizontal; min-width: 12rem">}}
{{</Partial>}}

In this example we can add a `.section-line` element, with all the same setup as before, and draw a line in it either horizontally or vertically based on the height of the content:

```CSS
.section-line::before {
  content: "";
  position: absolute;
  border: 3px;
} 

@container (height <= 2rem) {
  .section-line::before {
    inset: -0.5rem;
    inset-block-start: auto;
    border-bottom-style: solid;
  } 
}

@container (height > 2rem) {
  .section-line::before {
    inset-block: -0.5rem;
    inset-inline-start: -1rem;
    border-left-style: solid;
  } 
}
```

Here we are relying on the fact that we know how high our non-wrapped line of content would be — this allows us detect the moment when things wrap, as then the height would change. If we would have a potential for 3 or more lines being created, and if we would know the line-height[^line-height] for each line, we could style things differently for each case.

[^line-height]: Not the [`lh`](https://www.w3.org/TR/css-values-4/#lh)/[`rlh`](https://www.w3.org/TR/css-values-4/#rlh) though — container queries do not have access to the relative units, and also we could have things that extend the line-box, so using a `lh` here won't be reliable. <!-- offset="4" span="2" -->

Thinking of the use-case itself — I too, myself, sometimes wanted to detect when things wrap. However, when thinking about this more deeply, it can be very hard to describe how a potential feature like this could work without stumbling over the same issues we have with container queries. So far, I think using absolutely-positioned elements with container queries sounds like the closest we could get to solving this use-case. Though, looking into the future, [anchor positioning](/anchor-positioning-experiments/) could help with this even more.

### Adapting to the aspect ratio

The next experiment can be used not only for decorations. Sometimes we could want to rely on the element's intrinsic dimensions, but also position something on top of the element.

Common case being various captions and toolbars over images or videos. Guess what — if we're positioning something absolutely, then we're free to use container queries in any way we want!

As an example, we can detect the aspect-ratio, and position our caption vertically when we see a vertical element.

{{<Partial src="examples/contained-decorations-3.html" Zscreenshot="true" Zvideo="true" style="padding: 3rem; min-width: 14rem;">}}
{{</Partial>}}

(Hover/focus the examples to see the caption appear).

Source code for this example is a bit more involved, so I won't show it to you here, but you're free to look into the source. But other than the same setup as before, all we really need is to apply `@container (aspect-ratio < 1) { … }` to detect when the element is vertical.

One interesting thing is that I'm using the `writing-mode` to handle the text rotation, and, when possible, using the `sideways-lr` value for it, otherwise, if it is not supported, have to use `tb` and rotate the element over `180deg` to get the same result.

This method of detecting the aspect-ratio was actually the first time I used this method — as a part of one example for my [“Future CSS: Anchor Positioning”](/anchor-positioning-experiments/) article. And, in general, given that all anchored elements are absolutely positioned… we're free to use container queries on them without any limitations! I'll probably apply this technique in my future experiments with anchor positioning, so stay tuned.

### Experimental: Transitions for Container Query Length Units

Now, something completely different. Though, slightly less practical (at least for now — see the end of this section).

When reading the specs related to the container queries, I stumbled upon one particular place related to how [transitions should work](https://www.w3.org/TR/css-contain-3/#animated-containers):

> Changes in [computed values](https://www.w3.org/TR/css-cascade-5/#computed-value) caused by [container query length](https://www.w3.org/TR/css-contain-3/#container-query-length) units must also be part of a [style change event](https://www.w3.org/TR/css-transitions-1/#style-change-event).

This might sound a bit cryptic, but what it means is: **values that are based on container query units would have transitions when they change**. Because these units are evaluated to final `px` values, they can be transitioned even when the dimensions of the original container are `auto`.

Usually this is not super useful — after all when we apply containment, we remove the attachment of the container dimensions from the intrinsic content sizes… But as we did learn from the previous examples, absolutely positioned elements allow us to overcome this.

So, what would happen if we'd have a regular element with some fit-to-content dimensions, and then stretch an absoltely positioned container on top of it, _and then_ put an element inside this container that would have its dimensions equal to `100%` of the container's width and height… but expressed in container query length units?

Fun stuff would happen! I'll show all the examples first, then would get to the code, as there are a few nuances to talk about there.

#### Transition on Resize End

Let's look at this example:

{{<Partial src="examples/contained-decorations-4-1.html" Zscreenshot="true" Zvideo="true">}}
{{</Partial>}}

The result is quite interesting, eh? By using a transition with a slight delay we can kinda implement a “resize end”, where the inner element would follow our resize bounds only when we stop resizing.

I think this example demonstrates the effect quite well: we change the size of one element, then another element follows suit after our transition, making it possible to create a lot of interesting effects.

Like, we can even nest a bunch of these elements, and make every one of them a container as well, to get this:

{{<Partial src="examples/contained-decorations-4-2.html" screenshot="true" video="true">}}
**Caution: this example can have excessive motion inside.**
{{</Partial>}}

#### Transitions for Unknown Dimensions

I don't think there is a lot of use for the above examples, but the main point of interest for me is in transitions between `auto` values for `width` and `height`. Due to our technique of stretching the container over a regular element, we can put anything inside this element, and get the transitions for this stretched element whenever the content changes.

A rather simple way to demonstrate this would be to wrap it around a `<details>` tag:

{{<Partial src="examples/contained-decorations-4-3.html" screenshot="true" video="true" style="width: max-content; height: 8.3rem">}}
{{</Partial>}}

We can see both the strengths of this method, but also its main weakness — because only the absolutely-positioned element has the transition, we need to either still reserve some space (I'm doing it vertically, so the content below won't jump), or have the content/wrapper change immediately.

#### Bugs and Issues

When working on this article I encountered a number of bugs, both with the container queries and around.

For example, one thing we could, potentially, try to improve things around how element appears and disappears is by using the new display transitions, as well as the `@starting-style`, but… Both in Chrome and Safari there are significant issues in how the `<details>` behaves with those, as well as with any initial animations.

- [Webkit bug](https://bugs.webkit.org/show_bug.cgi?id=254401) — already fixed, at the moment of writing this article the animation works properly in the Safari Technology Preview, but the fix did not yet land in the stable version. Fun fact — the bug was fixed 6.5 hours after opening.
- [Blink bug](https://bugs.chromium.org/p/chromium/issues/detail?id=1427375#c2) — still not fixed, since March 24.

You might think: ok, but that's the bug for the `<details>`, maybe it is ok to use with other elements? Yes and not exactly. Transitions and animations would work perfectly if we would change the `display` of our element. There are also other issues (but we can work around them):

- [Webkit bug with pseudo-elements](https://bugs.webkit.org/show_bug.cgi?id=253939) — this one leads to us being not able to use the pseudo-element with the container query length units, as they would get the incorrect container as the base for them. Solution is simple: use an extra element.

- [Mozilla bug with the initial transition for the container query length units](https://bugzilla.mozilla.org/show_bug.cgi?id=1823255) — Makes our stretched elements use the viewport for their initial state, triggering the transition when the container is then applied, resulting in a weird initial transition when the element appears. Can be worked around by adding a one-time initial animation for width & height.

- [Mozilla bug with the incorrectly cached container query length units](https://bugzilla.mozilla.org/show_bug.cgi?id=1835179) — makes different elements to have incorrectly synced dimensions, can also be worked around by a one-time animation, but where we add an insignificant animated CSS variable to our container query length units.

Basically, if we want to support all browsers and still use this technique, we have to not use pseudo-elements, and also apply the styles with a one-time animation that fixes things in Firefox.

I won't show you the code for the workarounds — I won't recommend using this method in production anyway, as there is no guarantee that there aren't other issues, so treat this as a very experimental thing.

There are also other CSS features coming our ways that could improve this technique and make some of its limitations go away, like anchor positioning — but this is a topic for a different article.

## Using Fallbacks

// backgrounds, borders, forced colors and old browsers

## Resources

// https://www.smashingmagazine.com/2021/05/complete-guide-css-container-queries/
// https://www.w3.org/TR/css-contain-2/#containment-size or 
// https://www.w3.org/TR/css-contain-3/
