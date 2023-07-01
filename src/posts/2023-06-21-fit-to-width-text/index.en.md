---
mastodon_post_id: "110581379745089361"
---

# Fit-to-Width Text

#Scroll_Driven_Animations #Future_CSS #Experiment #Typography #Practical #CSS

_What if I will tell you how we could solve fit-to-width text with pure CSS without any hardcoded parameters? Curiously, scroll-driven animations will allow us to do just that! Join me as I continue exploring the experimental implementations of the latest specs._

## The Example

Let me start with the demonstration: if you’d look at the following example in the browser[^browser] that supports [scroll-driven animations](/scroll-driven-animations/), you would see how the text fits the width of its container. The example has [`contentEditable`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable), so you could play with it or resize the container or browser window to see it automatically adapt to it.

[^browser]: At the time of writing this article, I’m testing it in Chrome Canary `116.0.5843.0`. <!-- offset="1" -->

{{<Partial src="examples/fit-to-width-text.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 8em; padding: 1rem; --sticky: yep;">}}
  Each line of the text in the example fits the width perfectly and follows the dimensions of the container when we resize it.
{{</Partial>}}

## Why Scroll-Driven Animations?

You could wonder: how does it work? And how [scroll-driven animations](https://www.w3.org/TR/scroll-animations-1/) help us achieve[^other-effects] it? We don’t even have anything that is scrollable here!

[^other-effects]: If you’re reading this article in Chrome Canary (and on a wide enough screen), you could notice that I’m using them for other things, trying to apply [my previous article about them](/scroll-driven-animations/) here. <!-- span="3" offset="1" -->

Let me walk you through this example: its code is not that long. The HTML is simple: a paragraph with multiple inline elements.

```HTML
<p class="fit-to-width" contentEditable>
  <span>What if I will tell you</span>
  <span>how we could use</span>
  <em>scroll-driven animations</em>
  <strong>to solve</strong>
  <span>fit-to-width text?</span>
</p>
```

CSS is more involved: I will show you the complete code[^nesting] for this example and then would try to explain what each line does:

[^nesting]: I’m trying to get used to CSS nesting, so I’ll have it in my example. All browsers that would support scroll-driven animations will support nesting. <!-- span="2" -->

```CSS
/* 1 */
@supports (animation-range: entry-crossing) {
  .fit-to-width {
    font-size: 13rem; /* 2 */
    overflow: hidden; /* 3 */

    scroll-snap-type: both mandatory; /* 4 */

    /* 5 */
    & > * {
      inline-size: max-content; /* 6 */
      line-height: 1;           /* 7 */
      transform-origin: 0 0;    /* 8 */

      animation: apply-text-ratio linear; /*  9 */
      animation-timeline: view(inline);   /* 10 */
      animation-range: entry-crossing;    /* 11 */

      display: block;           /* 12 */
      scroll-snap-align: start; /*  4 */
      contain: layout;          /* 13 */
    }
  }
}

/* 9 */
@keyframes apply-text-ratio {
  from {
    transform: scale(0); /* 14 */
    margin-block-end: -1lh; /* 15 */
  }
}
```

1. I’m wrapping everything in a `@supports`, checking for the `animation-range: entry-crossing` (checking for the `animation-timeline` made the example break in the current Firefox Nightly). Without scroll-driven animations, the rest of the code does not make much sense and will look broken.

2. The exact value for the `font-size` is not super important. However, we can think of it as “max-font-size”: our text won’t get bigger than this value, but it would shrink.

3. We’re using `overflow: hidden` because we don’t want to scroll anything: we don’t want to have `auto`. But because we want to use scroll-driven animations, we can use the `hidden` value, enabling them. That is expected, and this is one of the differences between `hidden` vs. [`clip`](https://drafts.csswg.org/css-overflow/#valdef-overflow-clip) values.

4. [Scroll snapping](https://drafts.csswg.org/css-scroll-snap/#scroll-snap-type) is optional: I use it because it makes a difference for a `contentEditable` element, preventing the potential scroll that could happen when typing. However, I would keep it even if there won’t be editable content, just in case.

5. Regularly, I would use a class here, but because I’m using a `contentEditable`, it is more convenient to use an immediate descendant combinator here.

6. By default, our nested elements would not go beyond the container. However, we want the content to go as far as possible beyond the overflow, which we can achieve with an intrinsic [`max-content`](https://drafts.csswg.org/css-sizing-3/#valdef-width-max-content).

7. Not strictly necessary, but better to set the `line-height` to something. For multiple lines, `1` could be a good value. Otherwise, we could make it bigger, allowing the font’s ascenders and descenders not to go beyond overflow.

8. At a later point, we would apply a `transform` to our elements, so we want to make sure the origin would be at the start of them instead of their center.

9. Here is the part where the “animation” part comes in. The only important place on this line is that we make it `linear`, removing the variation in scaling that can appear. Note that we have to mention this before the following `animation-` properties — even though they’re not a part of our shorthand if it would come after them, it would reset them anyway.

10. Here is where we get the “scroll-driven” part. We are using the [`view()` timeline](https://www.w3.org/TR/scroll-animations-1/#view-notation) in an `inline` direction, as our text would overflow in it due to the `inline-size: max-content` on line 6.

11. The important part! To achieve the desired behavior, we apply the `entry-crossing` [`animation-range`](https://www.w3.org/TR/scroll-animations-1/#named-ranges). With our elements overflowing the inline dimension of their container, this range would make it so that when each element is at the _start_ of it, the progress of the animation would have a value equal to the ratio of the container’s inline dimension to the element’s inline dimension. [Bramus](https://www.bram.us/) made [a nice visualizer tool](https://scroll-driven-animations.style/tools/view-timeline/ranges/#range-start-name=entry-crossing&range-start-percentage=0&range-end-name=entry-crossing&range-end-percentage=100&view-timeline-axis=block&view-timeline-inset=0&subject-size=taller&subject-animation=scale-up&interactivity=clicktodrag&show-areas=yes&show-fromto=yes&show-labels=yes) that can help understand how different ranges work.

12. Because we did use inline elements inside the paragraph wrapper, we have to make them have `display: block`.

13. It is optional, but I found `contain: layout` help with some of the ways the element is rendered when testing it with the `contentEditable`. Certainly, a place I would need to investigate more, but not really related to this technique.

14. The primary moving part of the solution that does the scaling: setting the “from” keyframe to have `scale(0)`, alongside our animation having the `entry-crossing` range, makes our overflowing content scale to the value we want!

15. A negative margin might not be necessary if we have just one line, as we could limit the container’s height instead (and potentially benefit from only applying a transform in an animation). However, because we’re using multiple lines and because `transform` makes the element keep its original place in the layout, we would want to adjust the vertical space that our line is taking. Conveniently, we can use the new [`lh` unit](https://www.w3.org/TR/css-values-4/#lh) to do so and adjust the height accordingly, again using the `entry-crossing` range.

## Limitations

I see the main limitation in how while we can set the `max` value for the `font-size`, we cannot get a `min` one, so long lines could get as small as possible.

Next, because we use the `transform`, if a font has special handling of different sizes, especially for smaller letters, these won’t be applied because we always render everything at a significantly bigger static size.

There might be other issues: note that this method is experimental, was not tested in production, and there is no guarantee that it will continue to work when the scroll-driven animations would land in every browser.

## Potential Native Feature

I would like to see this implemented natively and not rely on an unintended usage of scroll-driven animations, even though the final code is relatively straightforward.

There is [an issue about this on CSSWG](https://github.com/w3c/csswg-drafts/issues/2528) — I recommend liking it and providing your use cases and thoughts on the potential API and requirements of this feature.

## Final Words

Fun fact: this is a “third-order” article. A few weeks back, I started writing a continuation of [my article about anchor positioning](/anchor-positioning-experiments/). Then, when doing experiments for it, I created something using multiple different techniques. That led to me starting to write a second article about that experiment. As a part of this experiment, I used this method of getting the ratio of an element to its parent via scroll-driven animations. And then, the following morning, I randomly thought about another use case for this ratio technique — and now you’re reading this article.

That means you have at least two more articles coming your way. At least one of them would have a different usage for this “ratio from a suspended animation” technique — and until we would get [an ability to strip units in calculations](https://github.com/w3c/csswg-drafts/issues/545), which was added to the [`css-values-4` spec](https://www.w3.org/TR/css-values-4/#calc-type-checking) a while ago, but was not implemented[^bug-trackers] in any browser yet. If you ever wanted to get ratios out of different lengths, try using this technique and let me know about the results!

[^bug-trackers]: Links to the bug trackers: [Chromium](https://bugs.chromium.org/p/chromium/issues/detail?id=1432187&q=division%20of%20same%20types&can=2), [WebKit](https://bugs.webkit.org/show_bug.cgi?id=255280), [Mozilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1827404). <!-- offset="4" -->

I cannot wait for the scroll-driven animations to be available everywhere — it is fascinating what getting access to the information about the overflow and the scroll position in CSS allows us to do. Another recent example (though much hackier) was [Johannes Odland](https://front-end.social/@johannes) coming up with the [“Scroll-persisted State”](https://johannesodland.github.io/state/scroll-snap/scroll-driven-animations/2023/06/18/scroll-persisted-state.html) technique.

I hope other browsers will start implementing this spec soon!
