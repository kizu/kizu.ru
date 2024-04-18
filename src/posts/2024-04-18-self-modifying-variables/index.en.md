---
og_image: "og_image.png"
mastodon_post_id: "112292594239211916"
---

# Self-Modifying Variables: the `inherit()` Workaround

#CSS_Variables #Style_Queries #CSS_Logic #Future_CSS #Experiment #CSS

_Style queries will unlock many doors. An ability to alternate a value of any variable that I presented in my previous article might seem to be trivial by itself, but what if there is a hidden depth in how we can utilize it? One interesting case is the ability to emulate `inherit()` — a way to access the previous state of a custom property._

The technique described in this article builds upon a technique described in the previous article: [“Alternating Style Queries”](/alternating-style-queries/). Thus, [the list of disclaimers](/alternating-style-queries/#disclaimers) from that article applies here as well.

In short, it uses container style queries, and thus is strictly experimental, as the only browsers they’re available in are stable Chrome and Safari Technology Preview under a feature flag. Do not attempt to use this in production! And if you have not read that previous article yet — I recommend it, as it allows you to understand today’s one better.


## The Problem

[The CSS spec for custom properties](https://drafts.csswg.org/css-variables/#cycles) defines how they handle cyclic dependencies, disallowing a custom property from referencing itself. This means that this is not possible:

```CSS
--depth: calc(var(--depth) + 1);
```

However, there are many cases, where we could want to do something like this.

[Lea Verou](https://lea.verou.me/) [proposed an `inherit()` function](https://github.com/w3c/csswg-drafts/issues/2864) in 2018, and CSSWG [resolved](https://github.com/w3c/csswg-drafts/issues/2864#issuecomment-816280875) to add it to the specs in 2021, though it was not edited-in yet.

In the CSSWG issue linked above, you can find many use cases, and many developers requesting this feature. I was one of them and was thinking for a while if we could work around the absence of it today.

In my recent experiments with [“Alternating Style Queries”](/alternating-style-queries/) I did find one way to achieve this by using container style queries. While we could not use it _today_, it is likely we will get style queries in all browsers sooner than `inherit()`.


## The Technique

Let me first show a quick demo and the code for the technique, and I will explain later what is going on.

{{<Partial src="examples/self-modifying-1.html" class="require-style-queries" screenshot="true" alt="A screenshot of an example, showing four rounded elements nested into each other and numbered from 1 to 4. The background’s hue is different for every element, and the border-radius for all corners except for the top-left one is decreasing with each level of nesting.">}}
In browsers that do not support style queries, you will see screenshots in place of this and the following examples.
{{</Partial>}}

The HTML here is pretty simple[^extra-element]:

[^extra-element]: Note the presence of the `.bar` element and how it does not have any effect. <!-- span="2" -->

```HTML
<div class="test">
  <div class="test">
    <div class="bar">
      <div class="test">
        <div class="test">
        </div>
      </div>
    </div>
  </div>
</div>
```

And here is the CSS responsible for the technique:

```CSS
* {
  @container not style(--is-alternate: ) {
    --is-alternate: ;
    --inherited--even: var(--inherit);
    --inherited: var(--inherited--odd);
  }
  @container style(--is-alternate: ) {
    --is-alternate: initial;
    --inherited--odd: var(--inherit);
    --inherited: var(--inherited--even);
  }
}

.test {
  --depth: calc(var(--inherited, 0) + 1);
  --inherit: var(--depth);

  --padding: 1em;
  padding: var(--padding);
  background: oklch(95% 0.125 calc(var(--depth) * 115));
  border-radius: calc(
    4.5 * var(--padding)
    -
    var(--depth) * var(--padding)
  );
  border-start-start-radius: calc(0.5 * var(--padding));

  &::before {
    counter-reset: depth var(--depth);
    content: counter(depth);
  }
}
```

What you see is a workaround “mixin” for [the `inherit()` function](https://github.com/w3c/csswg-drafts/issues/2864) for custom properties.

There are two rules:

1. By using a universal selector[^universal], “`*`”, we define our “mixin” that is applied to _every element_.

2. Now, in any other rule, we could “use” this mixin to store and retrieve the inherited value of any custom property.

[^universal]: It is not required to use a universal selector, and using it can lead to potential performance issues, but it allows us to make this more abstract and reusable. [Replacing the universal selector](#isolated-minimal-case) with the same selector where we will be using the “mixin” will lead to the same result. <!-- span="4" -->

### How It Works

#### Alternating Core

The crucial part of this solution is this part:

```CSS
* {
  @container not style(--is-alternate: ) {
    --is-alternate: ;
  }
  @container style(--is-alternate: ) {
    --is-alternate: initial;
  }
}
```

This is a variation of the [“Alternating Style Queries”](/alternating-style-queries/) technique, that allows us to alternate which properties and values will apply based on the elements’ nesting. The main thing that it guarantees is that we can have two rules that never apply to the same element in the DOM, but only to two consecutively nested elements, separating them.

Why do we need this? The core of the technique is based on how [Jane Ori](https://propjockey.io/about/) partially solved this problem in her [“CSS `--var: inherit(--var) + 2; ` Yes, you can! Without JS!”](https://dev.to/janeori/css-var-inherit-var-2-yes-you-can-without-js-2dic) article, from which I drew a lot of inspiration. In that article, she generates a group of selectors that separate two rules similarly, allowing us to use intermediate CSS variables to store an inherited value separately from the main one. I recommend reading this article to understand this part better.

Her method[^cross-browser-method] relies on a finite number of selectors: it will work up to a finite level of nesting. Additionally, it requires us to know the exact selector in advance, and bake it in all our complex `:not()` variations.

[^cross-browser-method]: Unlike what I’m talking about today, her method is cross-browser and can be (cautiously) used in production. This is a good sign: if the core method works in Firefox today, it should guarantee that when it gets container style queries, my article’s method will work there. <!-- span="3" -->

If we had full access to the HTML, we could use alternating classes to achieve the same. While doing research for this article, I found a [“Using recursive CSS to change styles based on depth”](https://vyckes.dev/writing/using-recursive-css-to-change-styles-based-on-depth/) article by [Kevin Pennekamp](https://vyckes.dev/) that does it with the help of the alternating classes.

Our method does not have any of these limitations: we’re not limited by the level of nesting, and we’re free to use any selectors we want.

#### Storing the Previous Value

Now that we did set up the alternating queries, we can use them to store our value, and use different custom properties on odd/even levels of nesting, similar to how [Jane did in her article](https://dev.to/janeori/css-var-inherit-var-2-yes-you-can-without-js-2dic#how-it-works-the-odd-even-var-chain):

```CSS
* {
  @container not style(--is-alternate: ) {
    --inherited--even: var(--inherit);
    --inherited: var(--inherited--odd);
  }
  @container style(--is-alternate: ) {
    --inherited--odd: var(--inherit);
    --inherited: var(--inherited--even);
  }
}
```

The main difference (outside the style queries) in our case is that I am using two additional custom properties:

- `--inherited`, which works as an alias to the current level’s variable;
- `--inherit`, which we will use as the “input” for our mixin.

#### Using the Inherited Value

By using these two extra variables, we’re abstracting our method in a way it becomes easier to use it on our element:

```CSS
.test {
  --depth: calc(var(--inherited, 0) + 1);
  --inherit: var(--depth);
}
```

Here, we can define our final variable — `--depth`, which uses our `--inherited` alias to retrieve its previous value.

The only thing left is to pass this `--depth` variable to our mixin’s input as the value for `--inherit` variable — and the technique is complete.

We hid all the odd/even logic into the alternating container style queries, and exposed a neat API for setting and retrieving the inherited value!

Now, we can use our `--depth` variable for anything that requires it, for example, to adjust the hue of backgrounds, to output the nesting level as a counter, or to adjust the `border-radius` to accommodate the padding:

```CSS
.test {
  --padding: 1em;
  padding: var(--padding);
  background: oklch(95% 0.125 calc(var(--depth) * 115));
  border-radius: calc(
    4.5 * var(--padding)
    -
    var(--depth) * var(--padding)
  );
  border-start-start-radius: calc(0.5 * var(--padding));

  &::before {
    counter-reset: depth var(--depth);
    content: counter(depth);
  }
}
```

### Mixin’s Nuances

One thing you might’ve noticed is that we are using the mixin on _every_ element, while the `.test` could be present on different levels of nesting, with an unknown count of extra wrappers around.

This is not an issue: the main thing this mixin does is it works around an inability to reuse the variable on the same level when setting a new value to it. When not setting or retrieving the values, the elements will continue to “juggle” these values down into the nested elements. What we did is we created a more complicated chain of inheritance and allowed to use it on any element.

### Multiple Mixins

Another obvious thing: with this, we can use our `--inherit` and `--inherited` variables for only one property at a time. What if we’d want to have it for different elements, with different nesting patterns? Or for two variables at the same time?

The way we can enable this is by exposing additional variables. We can duplicate the variables that do the storing and retrieving while keeping the alternating core intact. Here is what a second added “slot” for an inherited value can look like:

```CSS
* {
  @container not style(--is-alternate: ) {
    --is-alternate: ;

    --inherited--even: var(--inherit);
    --inherited: var(--inherited--odd);

    --inherited2--even: var(--inherit2);
    --inherited2: var(--inherited2--odd);
  }

  @container style(--is-alternate: ) {
    --is-alternate: initial;

    --inherited--odd: var(--inherit);
    --inherited: var(--inherited--even);

    --inherited2--odd: var(--inherit2);
    --inherited2: var(--inherited2--even);
  }
}
```

This gives us[^swapping-case] two additional variables: `--inherited2` and `--inherit2`, which could be used in the same way as the other two.

[^swapping-case]: I will demonstrate [a use case for this](#swapping-two-variables) later in the article. <!-- span="2" -->

### Isolated Minimal Case

As [I did mention before in a sidenote](#universal), while I like how mixins allow us to abstract everything and make reusable and readily available for any elements, in practice this might not be the most performant and maintainable way to use them: after all, we’re relying on the “global” slots, and several intermediate variables.

If we want to isolate this technique to a single element and ship it alongside it, we can simplify things:

{{<Partial src="examples/self-modifying-2-isolated.html" class="require-style-queries" screenshot="true" alt="A screenshot of an example (looking exactly like the previous one), showing four rounded elements nested into each other and numbered from 1 to 4. The background’s hue is different for every element, and the border-radius for all corners except for the top-left one is decreasing with each level of nesting.">}}
{{</Partial>}}

This is almost the same example as the previous one, but without using the additional `--inherited` and `--inherit` variables, baking in the `--depth`.

```CSS
.example-2 .test {
  @container not style(--is-alternate: ) {
    --is-alternate: ;
    --depth: calc(var(--inherited--odd, 0) + 1);
    --inherited--even: var(--depth);
  }
  @container style(--is-alternate: ) {
    --is-alternate: initial;
    --depth: calc(var(--inherited--even, 0) + 1);
    --inherited--odd: var(--depth);
  }
}
```

We have to repeat the calculation for the `--depth` in both style queries, but otherwise, this is enough for an isolated component to work. (Although, in practice, we’d want to namespace all the variable names to make them not clash with something else.)


## Use Cases

The examples above did demonstrate a “calculating the depth” use case: we can increment the value by one with each level of nesting, and use it for multiple things:

- Cycling through various hues in a background, calculating them rather than having a static list of the values as we could do with [“Alternating Style Queries”](/alternating-style-queries/).
- Matching the `border-radius` visually — one of the common use cases, mentioned in the [CSSWG `inherit()` issue](https://github.com/w3c/csswg-drafts/issues/2864) as well.
- Displaying the depth as a counter. Even though I did this for debugging purposes, it could be useful in other ways.

There are many other use-cases[^other-use-cases], both for using the _depth_ itself, and for passing around the inherited values outside it. Here are a few that I see on the surface.

[^other-use-cases]: [Jane’s original article](https://dev.to/janeori/css-var-inherit-var-2-yes-you-can-without-js-2dic) have a few, and the [CSSWG `inherit()` issue](https://github.com/w3c/csswg-drafts/issues/2864) have a lot of them.

### Nested Menu Lists

One of the oldest use cases I had for an ability to get a “depth” of some element: nested menus, where we’d want to have the items’ clickable area go full width. There are workarounds for this, but allowing elements to have proper growing padding based on the depth can be pretty handy:

{{<Partial src="examples/self-modifying-3-menu.html" class="require-style-queries" screenshot="true" alt="A screenshot of an example, showing a menu with nine elements, each with “Menu item” text, in five levels of nesting, with background going from red to purple based on it, and with the left padding increasing with each level of nesting.">}}
{{</Partial>}}

There are a few nested lists in the HTML, and the important part of this example’s CSS is this:

```CSS
.example-3 ul {
  --depth: calc(var(--inherited, 0) + 1);
  --inherit: var(--depth);
}
.example-3 li > a {
  display: block;
  padding: 1em;
  padding-block: 0.25em;
  padding-inline-start: calc(var(--depth) * 2em - 1em);
  background: oklch(93% 0.07 calc(var(--depth) * 75 - 30));
  border-radius: 1em;
}
```

After the usual setup for the inheritance on the `ul`, we’re using our `--depth` variable for the links’ padding[^padding] and background.

[^padding]: Note how we do this for the `<a>` tag, and not for the `<li>`, as we want to maximize the clickable area of our items, which is almost always a good practice. <!-- span="3" -->

How simple is that? With a native `inherit()` it could’ve been even better.


### Mixins with Children’s Styles

I used to experiment a lot with different ways CSS variables APIs can allow us to style elements. Recently, I came up with a way to create CSS mixins by using custom cascade layers and wrote a [“Layered Toggles: Optional CSS Mixins”](/layered-toggles/) article. Both in my older[^issue-comment] experiments and in [one of the examples for this article](https://codepen.io/kizu/pen/BaExxxz), I noted one aspect: when we want to style the children of an element, it might not be possible to reuse the custom variables from these styles if we would like to apply them on the same children.

[^issue-comment]: I [described](https://github.com/w3c/csswg-drafts/issues/2864#issuecomment-1211724786) this use case for `inherit()` in the comments for its issue. <!-- offset="3" -->

It is easier to show this in an example:

#### Broken Example

{{<Partial src="examples/self-modifying-4-flex-bad.html" class="require-style-queries" screenshot="true" alt="A screenshot of an example, showing four elements: A, B, C and D, — first two and the last two each wrapped into their own element, with the first group being entirely collapsed, and the second group taking all the available space.">}}
{{</Partial>}}

The HTML here is simple:

```HTML
  <div class="test">
    <div class="test" style="--grow: 0;">
      <div class="test">A</div>
      <div class="test">B</div>
    </div>
    <div class="test">
      <div class="test">C</div>
      <div class="test">D</div>
    </div>
  </div>
```

And here is the “faulty” CSS:

```CSS
.example-4-bad .test {
  display: flex;
  flex-wrap: wrap;
  padding: 0.5em;
  border: 1px solid;
  gap: 0.5em;
  --grow: 1;

  & > * {
    flex-grow: var(--grow);
  }
}
```

What is rendered is **not** what we wanted. Here is what was the expectation:

- We have a `.test` class that will enable flex display for the element and will apply `flex-grow` to all of its children.
- This `flex-grow` is controllable via a `--grow` custom property. It should not do anything to the element we apply it to, but should be used by the children.

Because we’re _nesting_ this element, and we apply our API by using the `--grow` on the inner child, what happens is that this variable is applied incorrectly, applying not just for the children of that element, but for that element itself.

Thankfully, our `inherit()` workaround can help us!

#### Fixed Example

{{<Partial src="examples/self-modifying-4-flex-good.html" class="require-style-queries" screenshot="true" alt="A screenshot of an example, showing four elements: A, B, C and D, — first two and the last two each wrapped into their own element, with both groups taking equal amount of space, but elements in the first group not expanding to fill their group.">}}
{{</Partial>}}

The HTML of this example is the same. And in CSS, alongside setting up our mixin, we did use it. This time not for changing or accumulating a value, but for exposing the element’s variable in a way it can be inherited without its new definition interfering!

Here is what did change:

```CSS
.example-4-good .test {
  --inherit: var(--grow);

  & > * {
    flex-grow: var(--inherited);
  }
}
```

Instead of directly using the `--grow` on the children, we pass it through our `--inherit` variable, and accept it via `--inherited`. And that’s it! The example behaves like we wanted it to do from the start.


### Swapping Two Variables

[Lea did mention this use case](https://github.com/w3c/csswg-drafts/issues/2864#issuecomment-842398907) in the issue: without `inherit()` we cannot switch two variables, as doing it on the same element will lead to circularity.

Our workaround can work for this well. In this example, I am using [multiple mixins](#multiple-mixins) version:

{{<Partial src="examples/self-modifying-5-swap.html" class="require-style-queries" screenshot="true" alt="A screenshot of an example, showing two columns, titled “regular” and “swapped”. In the regular column there are two elements: a green “A” and a pink “B”, in the second column their colors are swapped.">}}
{{</Partial>}}

We are applying our multiple mixins here, using them for two variables, and then on an inner element we use the inherited values to swap them:

```CSS
.example-5 {
  --a: var(--GREEN);
  --b: var(--PINK);
  --inherit: var(--a);
  --inherit2: var(--b);

  & .test {
    --a: var(--inherited2);
    --b: var(--inherited);
  }

  & .a {
    background: var(--a);
  }

  & .b {
    background: var(--b);
  }
}
```


## Do We Need `inherit()`?

Yes! Even though many of its cases could be covered with this container style queries technique, a built-in `inherit()` could be much easier to use, won’t have any potential clashing issues, will be more maintainable, and readable.

Moreover, one of its promises is the ability to get the inherited computed value of _regular_ properties — not just custom ones. This could allow for a multitude of other use cases to be possible, which now either require storing all values as custom properties or are not achievable at all.

However, similar to the style container queries for regular properties, I imagine we could get this type of `inherit()` later than the one for custom properties. Until we get `inherit()` in any way, thanks to this technique we could start involving its behavior as applied to custom properties. Well, after all, browsers will get it in their major versions for a while.

When coming up with the examples for this article, I had many other ideas, and I hope it will inspire you to experiment with this workaround for `inherit()`. The potential for this, I feel, is remarkable.
