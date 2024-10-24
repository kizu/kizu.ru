---
mastodon_post_id: "112814091114763105"
---

# Fit-to-Width Text: A New Technique

#Experiment #Typography #Practical #Future_CSS #CSS

_Registered custom properties are now available in all modern browsers. Using some pre-existing techniques based on them and complex container query length units, I solved a years-long problem of fitting text to the width of a container, hopefully paving the path towards a proper native implementation._

## The Example

Why don’t we look at the example of my new technique right away?

{{<Partial class="require-at-property" src="examples/fit-to-width.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 11.5em; padding: 1rem;">}}
  Each line of the text in the example fits the width perfectly and follows the dimensions of the container when we resize it, stopping at a certain minimum font size, the same as the one used for the paragraphs on this page.
{{</Partial>}}

The above example should work in [all browsers that support registered custom properties](https://caniuse.com/mdn-css_at-rules_property) — so, in all the latest versions today, now that Firefox got the support for them from version 128.

Slightly more than a year ago, I published my original [“Fit-to-Width Text”](/fit-to-width-text/) article, in which I used scroll-driven animations to achieve a similar effect.

A technique I present you today is very different from it: it has some flaws but is in many ways better than my previous hacky solution.

Alright, today’s solution is also _hacky_, but[^still-hacky] it proves that this effect is _possible_, and in the last section of this article I will outline a proposal for a native `text-fit` CSS property that could work similarly.

[^still-hacky]: **Disclaimer**: see a list of [limitations](#limitations) later, and do not use this in production without proper testing.

## The Code

Let me start with the worst part of the technique: HTML. It is not _too bad_, but it requires text duplication:

```HTML
<span class="text-fit">
  <span><span>fit-to-width text</span></span>
  <span aria-hidden="true">fit-to-width text</span>
</span>
```

And, alongside it, there are two extra wrappers around our text. I’ll explain how it works a bit later, right after showing its CSS[^not-optimal]:

[^not-optimal]: I am pretty sure this is not _the_ optimal way to write it, but while I see a few areas of improvement, I want to publish this article as soon as possible, so I am trying to contain my perfectionism.<br/><br/> If you have any suggestions, feel free to throw them at me!<br/><br/> **Update from 2024-07-20:** I updated the code in two places: I am now applying `white-space: nowrap` conditionally, and also modified the code to support nested usage as a way to [account for optical sizing](#accounting-for-optical-sizing). <!-- offset="1  " span="2" -->

```CSS
.text-fit {
  display: flex;
  container-type: inline-size;

  --captured-length: initial;
  --support-sentinel: var(--captured-length, 9999px);

  & > [aria-hidden] {
    visibility: hidden;
  }

  & > :not([aria-hidden]) {
    flex-grow: 1;
    container-type: inline-size;

    --captured-length: 100cqi;
    --available-space: var(--captured-length);

    & > * {
      --support-sentinel: inherit;
      --captured-length: 100cqi;
      --ratio: tan(atan2(
        var(--available-space),
        var(--available-space) - var(--captured-length)
      ));
      --font-size: clamp(
        1em,
        1em * var(--ratio),
        var(--max-font-size, infinity * 1px)
        -
        var(--support-sentinel)
      );
      inline-size: var(--available-space);

      &:not(.text-fit) {
        display: block;
        font-size: var(--font-size);

        @container (inline-size > 0) {
          white-space: nowrap;
        }
      }

      &.text-fit {
        --captured-length2: var(--font-size);
        font-variation-settings:
          'opsz'
          tan(atan2(var(--captured-length2), 1px));
      }
    }
  }
}

@property --captured-length {
  syntax: "<length>";
  initial-value: 0px;
  inherits: true;
}

@property --captured-length2 {
  syntax: "<length>";
  initial-value: 0px;
  inherits: true;
}
```

This is the complete CSS for the above example and consists of many moving parts.

## How Does it Work?

The idea behind this technique is similar to my previous attempt: what if we could get the ratio of our available space to the width of our text, and apply it as a modifier to this text’s size? In my scroll-driven animations technique I did apply it as a `transform`, but, this time, I can apply it as the proper `font-size` adjustment.

{{<Partial class="require-at-property" src="examples/ratio.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 4em; padding: 1rem;">}}
  Illustration showing how if the non-resized text would take 20% of the space, then the ratio of it to the available width will be 5 to 1.

  If we multiply our non-resized value by this ratio, it will become the full 100%.
{{</Partial>}}


But how do we get this ratio? How do we measure our content, the inline size of which is unknown?

### Container Query Length Units

The answer is to use containers: [they know stuff](https://www.youtube.com/watch?v=-Fw8GSksUIo)!

But wait… Did I mention that we want to measure the unknown inline size? And when we set up a container, don’t we lose its value, as the container will stop taking its children into account?

That’s where the hacky part with the text duplication comes into play.

#### Uncontained Sibling’s Effect

Yes, if we set up our container over the text with an unknown inline size, we couldn’t measure it. What we **can** do is invert the logic: we can measure not the inline size of the element itself, but _the remaining space_ we will have! And if we could measure our top-level container’s width, we could subtract that remaining space from it, getting our unknown — and now known — width as the result.

It should be easier to show it in a set of simplified examples, showing the technique step by step:

{{<Partial class="require-at-property" src="examples/step-1.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 4em; padding: 1rem;" />}}

Here a pink dotted outline shows the area of our element’s text content, and the green dashed outline shows the area of the remaining space which we can make into a container.

There are different ways we could achieve this; I found using Flexbox the simplest, here is the part that is responsible for this in the technique:

```CSS
.text-fit {
  display: flex;
  container-type: inline-size;

  & > :not([aria-hidden]) {
    flex-grow: 1;
    container-type: inline-size;
  }
}
```

When we have an element with an unknown width inside our container, and then add another element alongside it with `inline-size` containment and `flex-grow: 1`, it will grow to take the remaining space _while being a container_. It obeys the rules of containment: its children do not have any effect on it, but its siblings do have an impact!

#### Nested Containers and Named Container Query Units Workaround

You could’ve noticed that I mentioned two containers: our top-level one, which takes all the available space, and an inner one, which measures the width of our unknown text by proxy. And we’d want to get access to _both_, as container query units.

However, today[^named-cqlu] we do not have this as a feature in CSS: we only have _unnamed_ units like `cqi`, which, per the specs, get their value from the _closest_ container. So how can we get both the closest one, and skip it to access another one?

[^named-cqlu]: In the future, we could use named container query units for this. [Una Kravets](https://una.im/) did open a [CSSWG issue](https://github.com/w3c/csswg-drafts/issues/7858) about them, and it was resolved to add them to the specs. <!-- span="2" -->

That’s where registered custom properties can help us. When we register a custom property, and then assign a value to it, it is _captured_[^captured] on that element at the computed value time, allowing us to access it via inheritance. Here is the part responsible for it in our technique’s code:

[^captured]: I published a separate post about this in my blog: [“Captured Custom Properties”](https://blog.kizu.dev/captured-custom-properties/) <!-- offset="-3" -->

```CSS
.text-fit {
  container-type: inline-size;   /* 1 */

  & > :not([aria-hidden]) {
    container-type: inline-size; /* 2 */

    --captured-length: 100cqi;   /* 3 */
    --available-space: var(--captured-length); /* 4 */

    & > * {/* 5 */}
  }
}

@property --captured-length {    /* 3 */
  syntax: "<length>";
  initial-value: 0px;
  inherits: true;
}
```

1. We make our topmost wrapper element a container.
2. Its child that spans the remaining space is also a container.
3. We register a `--captured-length` custom property, and now if we assign `100cqi` to it, its value will be evaluated on that element. As container query units are available only on the children of some containers, even though that child is a container itself, it will receive the `cqi` from its parent.
4. We are planning to reuse the `--captured-length` variable later, so we can save this value to a different custom property: `--available-space`. Custom CSS properties are expanded when they’re used, so when the children will access the `--available-space`, they will receive the captured value from the parent element even if we’d override the `--captured-length` later.
5. Finally, in the deeply nested element we can access the topmost container’s width as `--available-space`, and the middle container’s width as `cqi`.


### Getting the Ratio

Now we have two lengths: `--available-space` of our furthest container, and our closest container’s inline size.

Ideally, we could just now divide one by another — [the specs](https://www.w3.org/TR/css-values-4/#calc-type-checking) do specify that this should work, but no browser has implemented it yet.

However, that’s where a [“CSS Type Casting to Numeric: `tan(atan2())` Scalars”](https://dev.to/janeori/css-type-casting-to-numeric-tanatan2-scalars-582j) article by [Jane Ori]() comes to help with a workaround[^mentions]! By using the `tan()` with `atan2()` CSS functions, we can essentially divide one length by another and get the unitless ratio as the result!

[^mentions]: In the last few weeks, I saw this technique mentioned a few times, probably due to `@property` being released in Firefox. I also experimented with it a lot, but did not have an opportunity to share any of my experiments, until today. <!-- offset="2" span="3" -->

Here is how we end up getting our ratio:

```CSS
.text-fit {
  & > :not([aria-hidden]) {
    & > * {
      --captured-length: 100cqi;
      --ratio: tan(atan2(
        var(--available-space),
        var(--available-space) - var(--captured-length)
      ));
    }
  }
}
```

Due to some browser bugs related to the `tan(atan2())` method, we can’t just use `100cqi` inside our `--ratio` calculation, but we can reuse the `--captured-length` by first saving it to a registered custom property, and now calculating our ratio.

### Finishing Touches

Now, with the bulk of the technique out of the way, there are a few remaining things we need to do.

Now that we know the ratio, we can apply it to our `font-size`. As this is just a regular `font-size`, we can use `clamp()` to make sure it never goes lower than our original font size, and never higher than a specified `--max-font-size` if we want to limit[^infinite] how much something can grow. And if we would rather not limit it — we could make the default value of it to be _infinite_.

[^infinite]: See my [“Observation: Clamp to Infinity”](https://blog.kizu.dev/clamp-to-infinity/) blog post about this mini-technique. <!-- offset="3" -->

```CSS
.text-fit {
  & > :not([aria-hidden]) {
    & > * {
      font-size: clamp(
        1em,
        1em * var(--ratio),
        var(--max-font-size, infinity * 1px)
      );
    }
  }
}
```

{{<Partial class="require-at-property" src="examples/step-2.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 4em; padding: 1rem;" />}}

Because our text with a modified size is inside our growing but contained element, it does not have all the space available. That’s not a big deal: we already saved the `--available-width`, and we can now apply it, so the element with the increased size won’t wrap.

```CSS
.text-fit {
  & > :not([aria-hidden]) {
    & > * {
      inline-size: var(--available-space);
    }
  }
}
```

In case the width of our resized text will go beyond the available width — after all we only approximate it — we don’t want it to wrap. Initially, I did want to just bump the `inline-size` slightly to account for this, but then I looked at how our container with the remaining space behaves: when our original text is smaller than the available size, we know that it does not wrap. When it becomes wider, there is no space available. And, as we already have a container, we can use container query to apply `white-space: nowrap` conditionally!

```CSS
.text-fit {
  & > :not([aria-hidden]) {
    & > * {
      @container (inline-size > 0) {
        white-space: nowrap;
      }
    }
  }
}
```

I also flipped the order of our elements, making it so our text with the initial font size goes after the adjusted one, allowing us not to do anything special about positioning:

{{<Partial class="require-at-property" src="examples/step-3.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 4em; padding: 1rem;">}}
  Example with an added double outline around the adjusted text.
{{</Partial>}}


To finalize things, we hide our original text via `visibility: hidden`, adjust the `line-height`, and that’s mostly it!

{{<Partial class="require-at-property" src="examples/step-last.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 4em; padding: 1rem;">}}
  Final example without any outlines shown.
{{</Partial>}}

### Fallbacks

There are many ways we could set up our fallbacks, for example, see a [“Feature detect CSS `@property` support”](https://www.bram.us/2024/07/03/feature-detect-css-property-support/) article by [Bramus](https://www.bram.us/). I decided to reuse the single registered property that we already have:

```CSS
.text-fit {
  --captured-length: initial;
  --support-sentinel: var(--captured-length, 9999px);

  & > :not([aria-hidden]) {
    & > * {
      font-size: clamp(
        /* … */
        -
        var(--support-sentinel)
      );
    }
  }
}

@property --captured-length {
  syntax: "<length>";
  initial-value: 0px;
  inherits: true;
}

```

Here I am using it on the topmost container, relying on the interesting behavior of registered custom properties, where they won’t ever use the fallback value, but will apply their specified `initial-value` instead.

This allows us to define a variable that will result in a `9999px` value when the custom property is not registered and will be `0px` when we register it. Then we subtract it from our upper bound, making the font limited by the lower bound, which is just `1em`.

### Accounting for Optical Sizing

When I posted[^updated-later] the article for the first time, I mentioned that if a font will have a variation in optical sizing based on its `font-size`, then my technique won’t work correctly. [Scott Kellum](https://scottkellum.com/) and [Roel Nieskens](https://pixelambacht.nl/) [confirmed this](https://front-end.social/@pixelambacht@typo.social/112818142019407942) in comments to my mastodon post, which led to a discussion and some more
experiments, in which I found a solution for this case as well.

[^updated-later]: This section was added a day after posting, on 2024-07-20.

#### Variable Fonts Problem

What is the problem? Some variable fonts can contain an optical sizing axis, which can change how various glyphs are displayed based on the font size. That means that if we render the original text in a small size, it could look very different from the same text but with the increased size, including the difference in the dimensions of various glyphs.

Here is the first example from this article, but with [the Fraunces font](https://fraunces.undercase.xyz/) applied:

{{<Partial class="require-at-property" src="examples/broken.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 8em; padding: 1rem;">}}
  The line of the text in the example does not fit the width perfectly, changing drastically when we resize the width of the container.

  The remaining space on each line is shown with pink rectangles.
{{</Partial>}}

For Fraunces, the optical adjustment of the larger sizes makes the glyphs narrower, making the proportional increase not fill the lines fully.

Other fonts could have different optical adjustments, potentially making the lines _wider_.

#### Nested Solution

The most trivial solution for this could be just disabling the optical sizing by setting `font-optical-sizing: none`, but then the text won’t look as good.

The proper solution involves duplicating the text once more, or, more specifically, _nesting_ my solution inside itself, alongside two small adjustments. Here is a modified HTML for one such line:

```HTML
<span class="text-fit">
  <span>
    <span class="text-fit">
      <span><span>fit-to-width text</span></span>
      <span aria-hidden="true">fit-to-width text</span>
    </span>
  </span>
  <span aria-hidden="true">fit-to-width text</span>
</span>
```

We replace the inner span with the same component. Then, we need to adjust the CSS slightly. First, instead of applying the `font-size` directly, we save it to a `--font-size` custom property. Then, we add this:

```CSS
.text-fit {
  & > :not([aria-hidden]) {
    & > * {
      --support-sentinel: inherit; /* 1 */

      &:not(.text-fit) { /* 2 */
        display: block;
        font-size: var(--font-size);

        @container (inline-size > 0) {
          white-space: nowrap;
        }
      }

      &.text-fit { /* 3 */
        --captured-length2: var(--font-size);
        font-variation-settings:
          'opsz'
          tan(atan2(var(--captured-length2), 1px));
      }
    }
  }
}

@property --captured-length2 {
  syntax: "<length>";
  initial-value: 0px;
  inherits: true;
}
```

For the inner span, we separate what we apply based on if it is a simple case, or if it is a nested one.

1. First, because we are nesting things, we need to reset the `--support-sentinel` on the inner element, as at that point `--captured-length` will be redefined.
2. For the simple case, we add the `display: block` there (as it is just a span), and directly use our `--font-size` variable. We also move the `white-space` definition there, so it will be only applied to the innermost element.
3. For the nested case, we first need to capture the `font-size` into a registered custom property — in this case, we have to add a new one, as we can’t reuse the existing — and then apply a `font-variation-settings` with its value via the `tan (atan2())` technique.

{{<Partial class="require-at-property" src="examples/solved-by-nesting.html" screenshot="true" video="true" style="overflow: hidden; resize: horizontal; min-width: 8em; padding: 1rem;">}}
  In this example, everything fits perfectly again. Resizing the example shows how the glyphs change, which can be especially noticeable for italics and the ampersand symbol.
{{</Partial>}}


That’s it! The way it works: on the first “layer” instead of applying the font size, we apply the optical sizing as if we were rendering the text with this new font size.

Then, we nest our technique, and now the optical sizing is fixed based on the approximate initial adjusted `font-size`, making the nested small text get the changed glyphs, adjusting its dimensions, and allowing the second adjustment to the `font-size` take this into account.

Note how we only need to use nesting if we need to account for the optical size adjustments: the CSS stays the same across the more simple cases and this one.

## Features

This technique is better than my previous one in many ways.

- It uses the proper `font-size` adjustment, not a faux scaling.
- It works in the latest Firefox and Safari.
- It supports a minimum font size, with the text properly wrapped when reaching it.
- It supports a maximum font size, with the text stopping expanding once reaching it.

## Limitations

Outside the optical size adjustment limitation of the more simple case, there are other general downsides, some of which I have already mentioned in the article.

- The [`@property` browser support](https://caniuse.com/mdn-css_at-rules_property) is not perfect, but we can fall back gracefully.
- There is a text duplication and extra wrappers, so it can be a bit tricky to implement, and requires `aria-hidden` for hiding the duplicated text.
- This is an experimental technique, so there is always a chance I did miss something, and an issue could appear in the future.


## A CSSWG Proposal

There is already[^past-proposal] a [“Feature for making text always fit the width of its parent”](https://github.com/w3c/csswg-drafts/issues/2528) issue by [Tobi Reif](https://tobireif.com/) in CSSWG GitHub about the problem this technique solves.

[^past-proposal]: As [Alan Stearns](https://github.com/astearns) [pointed out](https://front-end.social/@famulimas/112814679500989185) in Mastodon, something like this was proposed a long time ago, for example, [Tab Atkins-Bittner](https://xanthir.com/) proposed it in the www-style mailing list: [“Suggestion for text-overflow:shrink”](https://lists.w3.org/Archives/Public/www-style/2009Oct/0031.html) in 2009. <!-- span="3" -->

Given the technique works just by using existing CSS features without relying on unintended effects (unlike my scroll-driven animations solution), it proves that **this is possible**.

I believe that this shows how browsers are capable of achieving this technique today and, similar to how we got the `text-wrap: balance`, it will be possible to implement this effect as a built-in CSS feature.

The exact naming and syntax are to be specified (I’d go for something like `text-fit: full` or `text-fit: full up to 10em` for setting the upper limit), but [here is my comment in the above issue](https://github.com/w3c/csswg-drafts/issues/2528#issuecomment-2239624304). As I mentioned there — any feedback is welcome.

I invite browser developers to experiment with this algorithm and prototype a native CSS property that will allow us to achieve this effect natively. There is a clear need for this feature: my article about scroll-driven animation solution was one of my most popular ones, and the GitHub issue is in the [top 25](https://github.com/w3c/csswg-drafts/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc) most liked open issues of CSSWG issues.

It would be great to not rely on wild hacks and complicated markup to achieve it, even though I am happy I managed to solve this problem finally.
