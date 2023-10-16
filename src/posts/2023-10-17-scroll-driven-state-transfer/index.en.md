---
mastodon_post_id: "111245975348860927"
---

# Scroll-Driven State Transfer

#Scroll_Driven_Animations #Future_CSS #CSS_Variables #Experiment #Practical #CSS

_In my fourth article about scroll-driven animations, I explore how we can transfer the state of one element to a completely different place on a page by connecting them with a unique identifier in CSS via a timeline-scope._

## Introduction

Today’s technique is a variation of an effect that I previously demonstrated a few times:

- [“Future CSS: Anchor Positioning”](/anchor-positioning-experiments/#cross-referencing) from earlier this year.
- [“Label-to-Input States”](/label-to-input/) — an article from 2017.
- I used to[^used-to] have the above method implemented for cross-highlighting the sidenotes with their references for articles on my site.

[^used-to]: With this article’s release, I’m replacing this method with the new one. This is an example of such a sidenote! The method works only in Chromium-based browsers for now, but I like it more than the very hacky and not very accessible method that I used to have. <!-- offset="1" span="2" -->

The gist of the effect I’m talking about is an ability to mirror a particular state of some element — for example, hovered or focused — to an element in a different place on the page without a common or unique ancestral element that could have been used to deliver that state[^can-has].

[^can-has]: If we have the same ancestral element and can target our elements in some way, like placing pre-defined classes, we could implement this with the `:has()` selector, but for any new values we’d have to modify the stylesheet afterwards. <!-- span="4" offset="0" -->

The minimal API that I want in the end is to be able to connect two elements via a shared unique identifier without modifying the global CSS stylesheet — without adding new selectors and rules.

Today, as you could have guessed from the article name, I’ll implement this effect with scroll-driven animations.

## Disclaimers

1. At the moment of writing, [scroll-driven animations](https://drafts.csswg.org/scroll-animations-1/) are implemented only in Chromium-based browsers, but I am providing videos for all the examples, allowing you to see how they work. However, for the best experience, try opening the article in Chrome, Edge or Opera; it can be fun to play with the examples there!

2. This is my fourth article[^three-other-articles] on the topic of Scroll-Driven Animations. While the method I’m talking about today does not directly follow what I wrote before, I would skip a lot of the links to this CSS feature’s specs and assume you know what they are in general.

3. In the examples, I’m using this effect to _connect_ the elements in various ways, but that connection is only visual. If that technique is to be used in production (which I do not recommend until it lands in all browsers), then based on the use case, you’d need to think about how that connection could be conveyed in non-visual ways, like by using the `aria-describedby` and alike. If you know how this can be done properly and are willing to share it with me, anything would be welcome, as I’m not an accessibility expert.

    There is a chance that in the future we would be able to use the values from the HTML attributes as parts of the idents in CSS (see [this CSSWG issue](https://github.com/w3c/csswg-drafts/issues/9141) by [Bramus](https://www.bram.us/)), in which case we could use the values of the `id`, `aria-describedby` and other attributes to construct the idents in CSS and connect the elements without using additional custom properties.

[^three-other-articles]: I recommend checking out the older articles: [“Future CSS: Wishes Granted by Scroll-driven Animations”](/scroll-driven-animations/), [“Fit-to-Width Text”](/fit-to-width-text/), and [“Position-Driven Styles”](/position-driven-styles/). <!-- offset="6" -->

## The Core Technique

Let me take the [“Cross-Referencing”](/anchor-positioning-experiments/#cross-referencing) example from [my article about anchor positioning](/anchor-positioning-experiments/) and replace its method with scroll-driven animations instead:

{{<Partial class="require-animation-range" src="examples/example1.html" screenshot="true" video="true">}}
  Hovering or focusing on various items in this example would highlight the other corresponding elements.
{{</Partial>}}

The HTML for that example is exactly the same as for the anchor-positioning example: the only thing we need in order to connect our elements are `--is` and `--for` custom properties with the dashed idents as values.

And here is the whole CSS that is responsible for the technique in that example:

```CSS
@keyframes --is-active--example1 {
  entry 0%, exit 100% {
    --is-active: initial;
  }
}

.example1 [style*='--is:'] {
  animation: --is-active--example1;
  animation-timeline: var(--is);

  --is-active: ;
  outline: var(--is-active, 4px solid hotpink);
}

.example1 [style*='--for:']:is(:hover, :focus-visible) {
  view-timeline: var(--for);
}

.example1 {
  timeline-scope: --property, --value, --none, --display,
    --hidden, --visibility, --zero, --opacity;
}
```

It is a bit more involved than the anchor-positioning one, so let’s go through it step by step.

### Named Timeline Range Keyframe Selectors

Let’s start from the `@keyframes[^keyframes-notation]`:

[^keyframes-notation]: It is not necessary to use a [dashed ident](https://drafts.csswg.org/css-values/#dashed-idents) here; any custom ident would work, but I recently prefer to use dashed idents for any _custom_ entities in CSS, as I find them much easier to differentiate from regular ones. <!-- span="2" -->

```CSS
@keyframes --is-active--example1 {
  entry 0%, exit 100% {
    --is-active: initial;
  }
}
```

This was the first time I played with [Named Timeline Range Keyframe Selectors](https://drafts.csswg.org/scroll-animations-1/#named-range-keyframes).

They are a handy way of specifying the timeline range right in the `@keyframes`, which gives us the benefit of no longer having to write the explicit[^explicit-ranges] `animation-range: entry 0% exit 100%` whenever we use these keyframes, making it easier to reuse them.

[^explicit-ranges]: One alternative to using this new `@keyframes` feature I looked into was hacking the explicit range to be just `animation-range: 0 0`, and then setting the `animation-fill-mode: both` to make the animation apply all the time, but that is more cumbersome and would require wrapping the animation with `@supports` to mask it from browsers that do not support scroll-driven animations. By embedding the range right into the keyframes, we avoid all of these issues. <!-- span="6" offset="-2" -->

The `entry 0%, exit 100%` value covers the whole distance the element can be in inside its scrollport.

The main difference from the regular `animation-range`: we can only use percentages here, so we can’t use values in `px`, `calc()` etc.

The declaration that we set is `--is-active: initial`, which might seem weird, but it is just the “space toggle” in action. A bit more on this later.

### Applying the Animation and Using the State

```CSS
.example1 [style*='--is:'] {
  animation: --is-active--example1; /* 1 */
  animation-timeline: var(--is);    /* 2 */

  --is-active: ; /* 3 */
  outline: var(--is-active, 4px solid hotpink); /* 4 */
}
```

1. We’re using the `animation` shorthand to mention these `@keyframes` we defined previously. It doesn’t matter if we use the shorthand or just an `animation-name` here.
2. The important part is applying the timeline from the `--is` CSS variable. Here we are basically “subscribing” to a particular named timeline. More on this later.
3. The initial state for our `--is-active` space toggle[^space-toggles].
4. Using the space toggle: by default the outline would be just an empty value, but as soon as the animation would be applied, the `--is-active` would become `initial`, and the fallback value (`4px solid hotpink`) would be used.

[^space-toggles]: If you’re not familiar with what they are, I did compile a [brief history of how they were discovered](/cyclic-toggles/#was-this-always-possible) in my [“Cyclic Dependency Space Toggles”](/cyclic-toggles/) article. <!-- offset="6" -->

### Delivering the State

```CSS
.example1 [style*='--for:']:is(:hover, :focus-visible) {
  view-timeline: var(--for);
}
```

Whenever we want to apply our state — in this case, when we hover or focus over our element with the `--for` variable defined inline — we can apply this variable as `view-timeline`, and that’s it! Oh, wait, no, it isn’t. We forgot the most important part:

### Lifting the State Up with the Timeline Scope

```CSS
.example1 {
  timeline-scope: --property, --value, --none, --display,
    --hidden, --visibility, --zero, --opacity;
}
```

In order for this technique to work, we have to explicitly define the scope within which the timelines could be used. This is the biggest limitation of this method, as we have to list all the values we’d be using for our timelines; otherwise, we couldn’t define and reuse them on completely different elements in our scope’s subtree.

Because this requires only modifying one value of one CSS property[^can-have-variables], this can be done inline in HTML, so it does not require creating new rules in the stylesheets.

[^can-have-variables]: If we’d like, we could also utilize CSS variables, so multiple places could contribute to the same property (but it might be tricky to deliver these, as we could only do so from any ancestor elements, so I’m not sure about the use cases for this). <!-- span="2" offset="1" -->

There is good news: there is a chance we would get an `all` keyword possible for the `timeline-scope` property, which would allow us to just get _everything_ and not care about listing all the values explicitly. You can subscribe to [this CSSWG issue](https://github.com/w3c/csswg-drafts/issues/9158) if you’d like to follow any developments of this feature. When we have this built-in, this technique will become so much more powerful.

Now, that’s really it. For the basic technique.

## Variations

### One to Many

With anchor positioning, we initially had a limitation[^maybe-not-soon] where we couldn’t apply multiple anchor names to a single element. With timelines, we don’t have this problem, so it was very easy for me to modify our example above to allow a single element to target multiple others:

[^maybe-not-soon]: Since my first experiments, I [did open an issue about it](https://github.com/w3c/csswg-drafts/issues/8837), which was resolved with the latest version of Chrome Canary supporting multiple anchor names! <!-- offset="0" -->

{{<Partial class="require-animation-range" src="examples/example1-2.html" screenshot="true" video="true">}}
  Hovering or focusing on various items in this example would highlight multiple other elements.
{{</Partial>}}

Here we didn’t touch the CSS and only modified the HTML, re-shuffling our idents so one element now contains multiple names in a `--for` variable:

```HTML
<em style="
  --is: --property;
  --for: --display, --visibility, --opacity;
">
```

It works the same: the `--for` variable is delivered to the `view-timeline` property, which would happily accept any number of comma-separated timeline names; we don’t need to do anything special in addition to this.

### Many to One

Ok, so we can pass multiple values to the `--for`, but what about the `--is`? It won’t work as we would expect it to. Here is a broken example:

{{<Partial class="require-animation-range" src="examples/example1-3-broken.html" screenshot="true" video="true">}}
  Hovering or focusing on the first term highlights the proper items, but doing so on the next term does not work.
{{</Partial>}}

We kept the CSS the same, but the HTML for the above example contains this for the list items:

```HTML
<li>
  <code style="--is: --property, --none">
    visibility
  </code>
</li>
<li>
  <code style="--is: --none, --value, --display">
    none
  </code>
</li>
```

We can see that when we pass multiple comma-separated values to the `--is`, only the first one works, making it so one using `--property` works but nothing else does.

Why is that? Can we fix it? We can!

{{<Partial class="require-animation-range" src="examples/example1-3-fixed.html" screenshot="true" video="true">}}
  Hovering or focusing on all the terms would properly highlight their targets.
{{</Partial>}}

The fix is not perfect and can look a bit weird:

```CSS
.example1-fixed [style*='--is:'] {
  animation-name:
    --is-active--example1,
    --is-active--example1,
    --is-active--example1;
}
```

Yes, we did repeat the same `animation-name[^not-shorthand]` three times. Unlike other animation sub-properties, the `animation-name` is never repeated by itself.

[^not-shorthand]: As I’m using this to override the existing styles, I’m not using a shorthand, as otherwise we would lose the `animation-timeline` value, but if we wanted to define this right away, we could still use the shorthand. <!-- span="2" -->

When we provide multiple comma-separated values to `animation-timeline`, it does not create new animations. We can think of `animation-name` as the *leading* sub-property; all others are *followers*. If we have only one name, only one animation is applied. So we cannot apply any of the values `animation-timeline` which go to the non-existent animations. But if we define the name three times, we could “enable” each of the “slots” with our technique.

It’s not very convenient, but it works.

### Single Connecting Property

Before, we did use two different properties: `--is` and `--for` to connect our elements. This is just one of the many ways we could implement this; different needs might require different methods. One other way we could do it is to use a single property, especially when we want the connection to go both directions, like with the sidenotes in my blog.

If we don’t want to have groups of elements, we can simplify the first example by using only one custom property:

{{<Partial class="require-animation-range" src="examples/example2.html" screenshot="true" video="true">}}
  Hovering or focusing on any of the terms connects it with another one in the pair.
{{</Partial>}}

Here is the complete CSS responsible for this second example:

```CSS
@keyframes --is-active--example2 {
  entry 0%, exit 100% {
    --is-active: initial;
  }
}

.example2 [style*='--property:'] {
  animation: --is-active--example2;
  animation-timeline: var(--property);

  --is-active: ;
  outline: var(--is-active, 4px solid hotpink);
}

.example2 [style*='--property:']:is(:hover, :focus-visible) {
  view-timeline: var(--property);
}

.example2 {
  timeline-scope: --display, --visibility, --opacity;
}
```

If I wanted to replicate the first example more closely, I could have added `: not (: hover, : focus-visible)` to the rule with the animation, but I found the behavior where we highlight both elements each time even more useful.

And the only changes are a shorter list for `timeline-scope` and that the same variable is used for the selector and variable name.

### Boolean Logic

As with any other space toggles, we can apply a limited subset of [boolean logic](/cyclic-toggles/#space-toggles-logic) to them, like doing _NOT_, but for the “not active” state, I prefer to add a second space toggle, as it makes things easier to use. For example, the sidenotes on this page use these styles:

```CSS
@keyframes --is-active {
  entry 0%, exit 100% {
    --is-active: initial;
    --not-active: ;
  }
}

[style*='--sidenote:']:not(:hover, :focus-within) {
  animation: --is-active;
  animation-timeline: var(--sidenote);

  --is-active: ;
  --not-active: initial;
}

[style*='--sidenote:']:is(:hover, :focus-within) {
  view-timeline: var(--sidenote);
}

.Sidenote::before {
  opacity:
    var(--is-active,  1)
    var(--not-active, 0);
}

.Sidenote::after,
.Sidelink::after {
  background:
    var(--is-active,
      var(--LIGHT, rgba(255, 255,  0, 0.3))
      var(--DARK,  rgba(150, 140, 90, 0.3))
    )
    var(--not-active, transparent);
}
```

Having two variables each time: `--is-active` and `--not-active` is much more convenient than having to define a separate temporary variable if we’d want to use the `NOT` condition.

We can see how it is very easy to nest the space toggle values: for the active state, we can apply different values for the light and dark themes, as they’re also implemented with space toggles!

Note that we could have still omitted the `--not-active` for the `background`, but I like to make things more explicit when possible.

### Transitions

If you did manage to play with the sidenotes on this post, you could notice the transitions they have.

Here is a video of how they work:

{{<Video src="examples/video.html">}}
  A video of one of this article’s sidenotes, showing how hovering over the sidenote highlights its reference with a transition, and the other way around: hovering over the reference highlights the corresponding sidenote.
{{</Video>}}

An interesting aspect of the properties set by animations is that we cannot use them for transitions _on the same element_ due to the [animation tainting](https://www.w3.org/TR/css-variables-1/#animation-tainted).

However, what we _can_ do is have transitions on the children of the elements with our animations. By using pseudo-elements, I’m able to toggle the background and opacity with a transition.

One important note I’d want to add is that this is more experimental than the scroll-driven animations themselves; I did test this behavior without them, and while it currently works in both Chrome and Safari, it does not work in Firefox yet. There is [a known issue with custom properties toggled by animations](https://bugzilla.mozilla.org/show_bug.cgi?id=1763376), but in my testing, there is a difference even for regular inherited properties as well. I [did open an issue in Mozilla’s bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1858786) about that.

### Multiple States

In the previous examples, we had only one state: combined hover and focus. But what if we’d like to have them separately and have three or more different states?

Here is the first example, but with added differentiation of the focus and hover states:

{{<Partial class="require-animation-range" src="examples/example3.html" screenshot="true" video="true">}}
  In this example, there is a difference between hovering and focusing the terms.
{{</Partial>}}

There might be different ways this can be implemented. The one I choose for this example is not ideal, but it is the least intrusive: we have to add only one an additional timeline to the scope, then define the keyframes for it, using two states for on/off values:

```CSS
@keyframes --is-focused {
  entry 0%, exit 100% {
    --is-focused: initial;
    --not-focused: ;
  }
}
```

And then, when using it, use nested space toggles:

```CSS
.example3 [style*='--is:'] {
  animation: --is-active--example3, --is-focused;
  animation-timeline: var(--is), --is-focused;

  --is-active: ;
  --is-focused: ;
  --not-focused: initial;

  outline:
    var(--is-active,
      var(--not-focused, 2px solid pink)
      var(--is-focused, 4px solid hotpink)
    );
}
```

By doing this, we always know which element is currently hovered and focused and can differentiate which state it is based on the additional timeline we flip.

The downside of this method is that whenever we focus any of the items _and then_ use hover without removing the focus first, our hover styles would be the same as focused, as the focus state timeline is universal.

One way to handle this would be to introduce two different timelines _per value_, which is a bit cumbersome, or to introduce helpers for every item and do some clever stuff with view timelines, where we could always have the same timeline but would modify it in a way that would “choose” the right position corresponding to the keyframe we want to use. I’ve already been working on this article for too long[^too-long]. If you want, you can treat this as your homework: go and play with this technique and try to improve it!

[^too-long]: Originally, this should have been a much smaller article. I understand that the technique is a bit niche, but I hope there were enough interesting bits here and there that reading it was worth it! <!-- span="3" offset="5  " -->

## Final Words and Credits

That technique comes from my previous attempts at implementing it via anchor positioning, alongside a few other articles that were not directly related but still did contribute some inspiration and motivation:

- Eric Meyer’s [“Nuclear Anchored Sidenotes”](https://meyerweb.com/eric/thoughts/2023/09/12/nuclear-anchored-sidenotes/) article, with his take on using anchor positioning for sidenotes, in which he did call out my method of using anchor positioning for cross-highlighting the sidenotes (the newer one, from [this CodePen](https://codepen.io/kizu/pen/abRRavB)).

- Bramus’ [“Solved by CSS Scroll-Driven Animations: Detect if an element can scroll or not”](https://www.bram.us/2023/09/16/solved-by-css-scroll-driven-animations-detect-if-an-element-can-scroll-or-not/) article, which used a variation of the effect I’m also using, where we can detect the scroll based on if the scroll timeline is applied. He also did use the space toggle, and I’m happy this technique (originally coined by Jane Ori) gets more traction!

- Johannes Odland’s [“Scroll-persisted State”](https://johannesodland.github.io/state/scroll-snap/scroll-driven-animations/2023/06/18/scroll-persisted-state.html) article. My article is about a different type of state, but I can see how these two techniques could work in tandem to deliver a scroll-persisted state across a distance.

And, once again, even though I did use this technique for the sidenotes on my site, I do not recommend using scroll-driven animations for production. Only for these tiny progressive enhancement purposes, where you double-check that nothing would break in browsers that do not support the technology yet.

I can’t wait for `timeline-scope: all` to become available, as it would make this technique so much more powerful, and for scroll-driven animations to come to other browsers.
