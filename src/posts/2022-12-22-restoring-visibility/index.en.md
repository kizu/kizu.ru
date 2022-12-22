# Obscure CSS: Restoring Visibility

#Practical #CSS_Variables #CSS

_One of the things I love about CSS is how some of the properties hide a lot of depth inside. For that reason, `visibility` was always one of my favorites. In this article, I will talk about one of its interesting aspects and will propose an idea: what if we would never use `visibility: visible`?_

## Similarities and Differences

CSS is known for having multiple ways to achieve any given goal. It can lead to different properties being hard to distinguish from each other, leading to misconceptions or misunderstandings, resulting in using an incorrect tool for its job, which, in place, could lead to bugs.

[`Visibility`][] property can often be compared[^comparisons] to two other properties: [`display`][], and [`opacity`][]. All three properties can be used to “hide” an element:

[`Visibility`]: https://developer.mozilla.org/en-US/docs/Web/CSS/visibility

[`display`]: https://developer.mozilla.org/en-US/docs/Web/CSS/display

[`opacity`]: https://developer.mozilla.org/en-US/docs/Web/CSS/opacity

[^comparisons]: I find it useful to learn how something works by comparing it with other similar things. By looking at the differences, we could have a wider understanding of when we could use something, and when a certain approach would make more sense compared to others. <!-- span="2" -->

- `display: none` — completely removes an element from the layout, removing it from tab order, accessibility tree, and so on.
- `visibility: hidden` — an element is still present in the layout, but is not visible, does not receive focus, and is absent in the accessibility tree[^inclusively-hidden].
- `opacity: 0` — similarly to `visibility` an element keeps its place in the layout, but continues to receive focus & events, and will be present in the accessibility tree.

[^inclusively-hidden]: I can recommend reading this article by [Scott O’Hara](https://www.scottohara.me/) — [“Inclusively hidden”](https://www.scottohara.me/blog/2017/04/14/inclusively-hidden.html), if you'd want to learn more on how various ways of hiding content affect accessibility. <!-- span="3" offset="-3" -->


When we're hiding an element with `display: none` and `opacity: 0`, all of their children also become hidden, and there is no way to restore them.

`Visibility` is different. If a parent element is hidden with it, but then we will set `visibility: visible` on any of the descendant elements, this descendant's visibility will be restored, and it will appear where it should be, **regardless** of its parent visibility value.

Here is how it is defined in [the specs][] (emphasis is mine):

> <dl>
>   <dt>visible</dt>
>   <dd>The generated box is visible.</dd>
>   <dt>hidden</dt>
>   <dd>The generated box is invisible (fully transparent, nothing is drawn), but still affects layout. <em>Furthermore, descendants of the element will be visible if they have <code>visibility: visible</code></em>.</dd>
> </dl>

Now, let's look at an example:

[the specs]: https://w3c.github.io/csswg-drafts/css2/#visibility

### Example

<div>
  <style>
    #visibility:checked ~ .intro-example .is-hidden { visibility: hidden }
    #visibility:checked ~ .intro-example .is-visible { visibility: visible }    
    #display:checked ~ .intro-example .is-hidden { display: none }
    #display:checked ~ .intro-example .is-visible { display: block }    
    #opacity:checked ~ .intro-example .is-hidden { opacity: 0 }
    #opacity:checked ~ .intro-example .is-visible { opacity: 1 }    
  </style>
  <span>Hide using:</span>
  <input name="hide-property" type="radio" id="visibility" checked /><label for="visibility">visibility</label>
  <input name="hide-property" type="radio" id="display" /><label for="display">display</label>
  <input name="hide-property" type="radio" id="opacity" /><label for="opacity">opacity</label>
  <input name="hide-property" type="radio" id="nothing" /><label for="nothing">nothing</label>
  <div class="intro-example" style="min-height: calc(var(--THEME_LINE_HEIGHT) * 4);">  
    <figure>
      <div class="is-hidden">
        <p>I should be always hidden</p>
        <p class="is-visible">I could be visible!</p>
        <p>
          Only
          <span class="is-visible">this span</span>
          might be visible.
        </p>
      </div>
    </figure>
  </div>
</div>

```html
    <div class="is-hidden">
      <p>I should be always hidden</p>
      <p class="is-visible">I could be visible!</p>
      <p>
        Only
        <span class="is-visible">this span</span>
        might be visible.
      </p>
    </div>
```

We can play with the above example, changing which property is used for hiding or showing the elements — `visibility` is a noticeable outlier!

While we could use this aspect of the property to achieve something good[^use-cases], quite often, this could lead to unexpected results.

[^use-cases]: I won't provide the use cases in this article, as this is a bit out of scope, but maybe one day I will write about some of them. If you would happen to have one or would see a post somewhere describing one — let me know! <!-- offset="1" span="3" -->

## The Problem

If the `visibility: visible` is only used to _restore_ the visibility, this can lead to an issue with two independent components, where we could need to hide the wrapping one, but the one inside will have some descendant's visibility _restored_. With `visible` value, this inner element will become visible — which could not be what we would expect!

To reproduce the problem in the following example, you'd need to _hover_ over any menu item and then _click_[^click] on it.

[^click]: The issue won't reproduce when using keyboard navigation. Well, unless the list items won't also be hovered over.<!-- offset="1" span="2" -->

<style>
  .example {
    position: relative;
  }
  .example-target {
    position: fixed;
    top: 0;
    left: 0;
  }
  .example-target + a {
    position: absolute;
  }
  .example-target:not(:target) + a {
    visibility: hidden;
  }
  .example-target:target + * + figure {
    visibility: hidden;
    --visibility-override: hidden;
  }
  .example a {
    padding: 0.5em 0;
  }
  .example a + ul {
    /* We need this for the keyboard focus to properly stay */
    transition: visibility 0.01s;
  }
  .example--broken a + ul {
    visibility: hidden;
  }
  .example--broken a:is(:hover, :focus) + ul,
  .example--broken ul:is(:hover, :focus-within) {
    visibility: visible; /* This can lead to a bug */
  }
</style>
<div class="example example--broken">
  <div class="example-target" id="example-is-hidden"></div>
  <a href="#example-is-visible">Example is hidden! Click me to reset.</a>
  <figure>
    <ul>
      <li>
        <a href="#example-is-hidden" tabindex="0">Menu item</a>
        <ul>
          <li>
            <a href="#example-is-hidden" tabindex="0">Nested menu item</a>
            <ul>
              <li>
                <a href="#example-is-hidden" tabindex="0">Even more nested!</a>
                  <ul>
                    <li>
                      <a href="#example-is-hidden" tabindex="0">Final level item.</a>
                    </li>
                  </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </figure>
</div>

After clicking on any item, if you won't move your cursor, you should see the example wrapper disappear while the menu items would stay visible.

Why this happens:

1. Initially, the inner `<ul>` is hidden via `visibility: hidden`.
2. Then, it is shown by `visibility: visible` when we hover over a menu item.
3. Then, when we click on any of the items, the whole example wrapper gets a `visibility: hidden` applied to it.
4. But because we're still hovering over the list when this happens, we'd see the menu items, as, regardless of the list's ancestor being hidden, it is kept visible due to the `visibility: visible`.

Moving the cursor out of the list hides it, so it won't reappear, as there'd be nothing left to hover.

Here is what the CSS responsible for hiding/showing items looks like for this example:

```CSS
.example--broken a + ul {
  visibility: hidden;
}
.example--broken a:is(:hover, :focus) + ul,
.example--broken ul:is(:hover, :focus-within) {
  visibility: visible; /* This can lead to a bug */
}
```

## The Solutions

We can see how this behavior could be problematic on dynamic sites — and cases like this are something I encountered in my practice multiple times. The fixes for this — as soon as we'd identify them — are usually pretty simple, though.

### Hide-only Selectors

The easiest way to make “restoring” visibility not cause bugs is to never have to restore it! Here is how we can change the above CSS:

```CSS
.example--hide-only a:not(:hover, :focus) + ul:not(:hover, :focus-within) {
  visibility: hidden;
}
```

What we're doing here is “inverting” the logic for the rule that previously did revert the visibility, and only use one CSS rule to hide the content, listing the exact conditions for this. Here is the example fixed by this method:

<style>
  .example--hide-only a:not(:hover, :focus) + ul:not(:hover, :focus-within) {
    visibility: hidden;
  }
</style>
<div class="example example--hide-only">
  <div class="example-target" id="example2-is-hidden"></div>
  <a href="#example-is-visible">Example is hidden! Click me to reset.</a>
  <figure>
    <ul>
      <li>
        <a href="#example2-is-hidden" tabindex="0">Menu item</a>
        <ul>
          <li>
            <a href="#example2-is-hidden" tabindex="0">Nested menu item</a>
            <ul>
              <li>
                <a href="#example2-is-hidden" tabindex="0">Even more nested!</a>
                  <ul>
                    <li>
                      <a href="#example2-is-hidden" tabindex="0">Final level item.</a>
                    </li>
                  </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </figure>
</div>

### Restoring via Inheritance

While I'd argue that if we could write just one rule that does the job properly, we should do it, sometimes we cannot modify a selector, or doing so could be inconvenient for some reason. Can we keep the “hiding” and “showing” rules separate, restoring the `visibility` via an override, but without it causing problems?

Sure, we can! All we need to do is to use the `inherit` value instead of the `visible`!

```CSS
.example--inheritance a + ul {
  visibility: hidden;
}
.example--inheritance a:is(:hover, :focus) + ul,
.example--inheritance ul:is(:hover, :focus-within) {
  visibility: inherit;
}
```

By using `inherit` here[^not-initial], we are making sure that the visibility of our item would match the visibility of the parent — so if the parent is hidden, our element would be also hidden, and if the parent is visible — our element would be visible as well.

[^not-initial]: Note how this is different from `initial` — because `visibility` is _inherited_, and its initial value is `visible`, then setting it to `initial` on a non-root element would make it be `visible`, so we cannot use it the same way as `inherit`. On the other hand, `unset` and `revert` would work, but would be less expressive and explicit — as we know which property we're reverting, we can use the more appropriate `inherit` value.<!-- span="4" -->

Here is our example, now fixed by using inheritance.

<style>
  .example--inheritance a + ul {
    visibility: hidden;
  }
  .example--inheritance a:is(:hover, :focus) + ul,
  .example--inheritance ul:is(:hover, :focus-within) {
    visibility: inherit;
  }
</style>
<div class="example example--inheritance">
  <div class="example-target" id="example3-is-hidden"></div>
  <a href="#example-is-visible">Example is hidden! Click me to reset.</a>
  <figure>
    <ul>
      <li>
        <a href="#example3-is-hidden" tabindex="0">Menu item</a>
        <ul>
          <li>
            <a href="#example3-is-hidden" tabindex="0">Nested menu item</a>
            <ul>
              <li>
                <a href="#example3-is-hidden" tabindex="0">Even more nested!</a>
                  <ul>
                    <li>
                      <a href="#example3-is-hidden" tabindex="0">Final level item.</a>
                    </li>
                  </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </figure>
</div>

#### Fun Fact from the Past

There is a low chance this would be useful to anyone today (unless we’d travel to the past somehow and then would need to write CSS for IE6…), but anyway!

If we'd look at [“Can I Use…” for the global `inherit` keyword](https://caniuse.com/mdn-css_types_global_keywords_inherit), we will see that IE6-7 did not support it… But you know what? The `visibility: inherit` method _did actually work_ in IE6! All because it did apply an _unknown_ value instead of falling back to the previously valid one and treated the unknown `inherit` as the implicit _initial_ one, conveniently working as intended!

### Using CSS Variables

But what if we'd want to use `visibility: visible` to enforce the visibility inside some `hidden` context? And then we'll still want to hide everything inside some other context with `visibility: hidden` on it?

Let's say we'd modify our last fixed example, but this time we will add an element to the start of each list item that must[^yeah] be visible even when the items are not hovered:

[^yeah]: I know this exact example doesn’t make much sense, but in practice, there can be cases where we’d want to keep something visible. So let’s go with this example anyway, haha. <!-- offset="1" span="2" -->

<style>
  .example--with-visible-items ul a::before {
    content: "…";
    visibility: visible; /* This can lead to a bug */
  }
</style>
<div class="example example--inheritance example--with-visible-items">
  <div class="example-target" id="example4-is-hidden"></div>
  <a href="#example-is-visible">Example is hidden! Click me to reset.</a>
  <figure>
    <ul>
      <li>
        <a href="#example4-is-hidden" tabindex="0">Menu item</a>
        <ul>
          <li>
            <a href="#example4-is-hidden" tabindex="0">Nested menu item</a>
            <ul>
              <li>
                <a href="#example4-is-hidden" tabindex="0">Even more nested!</a>
                  <ul>
                    <li>
                      <a href="#example4-is-hidden" tabindex="0">Final level item.</a>
                    </li>
                  </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </figure>
</div>

In this case, we get a broken result when we click[^accessible-bug] on any of the items, where the added ellipsis pseudo-elements are visible even when we hide the parent. Here is how we show them in the first place:

[^accessible-bug]: This time, the bug reproduces even with keyboard navigation — such an accessible bug!

```CSS
.example--with-visible-items ul a::before {
  content: "…";
  visibility: visible; /* This can lead to a bug */
}
```

- We can't use `inherit` here, as we _need_ to break from the parent `<ul>`'s visibility in this case.
- We can't really use the “inverted” method — we _could_ use it for _some_ cases where we know the exact structure of our HTML, where we could target the specific conditions at which we need to hide everything, but this would be far from being practical.

However, if we're responsible for setting `visibility` everywhere, we can use CSS variables to achieve this! Look at this:

```CSS
.example--with-visible-items ul a::before {
  content: "…";
  visibility: var(--visibility-override, visible);
}
```

Instead of setting the `visible` value right away, we can use an intermediate CSS variable as an API that other components could use to hide this element on demand. This way, we'd only need to modify the place that applies the `visibility: hidden` to hide _everything_, adding a definition of our CSS variable alongside a regular `visibility`.

Here is the above example fixed by using CSS variables:

<style>
  .example--with-fixed-visible-items ul a::before {
    content: "…";
    visibility: var(--visibility-override, visible);
  }
</style>
<div class="example example--inheritance example--with-fixed-visible-items">
  <div class="example-target" id="example5-is-hidden"></div>
  <a href="#example-is-visible">Example is hidden! Click me to reset.</a>
  <figure>
    <ul>
      <li>
        <a href="#example5-is-hidden" tabindex="0">Menu item</a>
        <ul>
          <li>
            <a href="#example5-is-hidden" tabindex="0">Nested menu item</a>
            <ul>
              <li>
                <a href="#example5-is-hidden" tabindex="0">Even more nested!</a>
                  <ul>
                    <li>
                      <a href="#example5-is-hidden" tabindex="0">Final level item.</a>
                    </li>
                  </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </figure>
</div>

CSS variables can be very useful, allowing us to fix problems we could not resolve in other ways (or which could require much more complex and less reliable and maintainable code) — this is just another proof of that.

## Conclusion

Every time you will see a `visibility: visible` in your or your colleagues' code, try to understand what it is trying to do. Then, either:

- If the goal is to restore visibility, invert the logic, only using one rule with the `visibility: hidden`.
- Alternatively, replace the `visible` with `inherit` if the selectors are too complex.
- If the element _must_ be `visible`, instead of setting the value right away, use it as the value to a CSS variable, providing an API for your component that other components could use to hide your element reliably.

Maybe it could also be helpful to introduce a [stylelint][] rule prohibiting the `visibility: visible` declaration while allowing `inherit` or usage as a part of CSS variables fallback!

[stylelint]: https://stylelint.io/

And, as the last note — we can apply these methods to other similar cases: to most inherited properties like `color`, `font-size` (think of `font-size: 0;`), `pointer-events`, and others.

Even more — many things in this article are universal, like the “inverted selectors” method or using CSS variables as an API for specific properties. We can put them into our toolboxes, not just as a solution to a specific visibility problem but as something that could help in many other cases.
