# Obscure CSS: Restoring Visibility

#Practical #CSS_Variables #CSS

_One of the things I love about CSS is how some of the properties hide a lot of depth inside. For that reason, `visibility` was always one of my favourites. In this article I would talk about one of its interesting aspects, and would propose an idea: what if we would never use `visibility: visible`?_

## Similarities and Differences

CSS is known for having multiple ways to achieve any certain goal. This can lead to different properties being hard to distinguish from each other, leading to misconceptions or misunderstandings, resulting in using an incorrect tool for its job, which, in place, could lead to bugs.

[`Visibility`][] property can often be compared[^comparisons] to two other properties: [`display`][], and [`opacity`][]. All three properties can be used to “hide” an element:

[`Visibility`]: https://developer.mozilla.org/en-US/docs/Web/CSS/visibility

[`display`]: https://developer.mozilla.org/en-US/docs/Web/CSS/display

[`opacity`]: https://developer.mozilla.org/en-US/docs/Web/CSS/opacity

[^comparisons]: I find it useful to learn how something works by comparing it with other similar things — by looking at the differences, you would have a wider understanding of when a thing could be used, and when a certain approach would make more sense compared to others. <!-- span="2" -->

- `display: none` — completely removes an element from the layout, removing it from tab-order, accessibility tree and so on.
- `visibility: hidden` — an element is still present in the layout, but is not visible, does not receive focus, and is absent in the accessibility tree.
- `opacity: 0` — similarly to `visibility` an element keeps its place in the layout, but continues to receive focus & events, and might[^opacity-a11y] be present in the accessibility tree.

[^opacity-a11y]: Don't quote me on that — in the past there were reports that <abbr title="Accessibility Tools">AT</abbr> could mistakenly treat `opacity: 0` as not really visible. The case I heard about seems to be fixed now, but when playing with hiding elements visually, try to test things by yourself. <!-- span="3" offset="-2" -->

When we're hiding an element with `display: none` and `opacity: 0`, all of their children also become hidden, and there is no way to restore them back.

`Visibility` is different. If a parent element is hidden, but then we would set `visibility: visible` on any of the descendant elements, this descendant's visibility would be restored and it would appear where it should be, **regardless** of its parent visibility value.

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

We can play with the above example, changing which property is used for hiding or showing the elements — `visibility` is a noticeable outlier!

While this aspect of the property can be used to achieve something good[^use-cases], quite often this behaviour could lead to unexpected results.

[^use-cases]: I won't provide the use-cases in this article, as this is a bit out of scope, but maybe one day would write about some of them. Also, if you happen to have such, or saw a post somewhere describing one — let me know, and I could add those here! <!-- offset="1" span="3" -->

## The Problem

If the `visibility: visible` is only used to _restore_ the visibility that was previously hidden, this can lead to an issue where we could nest two independent components, where the wrapping one would need to be hidden, but the one inside would have some descendant's visibility _restored_. With `visible` value this inner element would become visible — which could be not what we would expect!

I often saw this happen for dropdown menus where elements were not hidden via `display` to allow for transitions and animations, and having `visibility:visible` on the inner elements while hovering forcing them stay on the screen even when the parents would already be hidden after navigation/action triggered from the menu forced the menu to be hidden.

To reproduce the problem in the following example, you'd need to _hover_ over any menu item, and then _click_[^click] it.

[^click]: The issue won't reproduce when using keyboard navigation. <!-- offset="1" span="2" -->

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

After clicking on any item, if you won't move your cursor, you should see the example wrapper disappear, while the menu items staying visible.

This is because the `<ul>` is first hidden via `visibility: hidden`, then on certain conditions (hover/focus) is shown via `visibility: visible`.

Then, when we click on any of the items, the whole example wrapper gets a `visibility: hidden` applied to it — but because we're hovering over the list when this happens, we'd still see the menu items, as regardless of the list's ancestor being  hidden, it is kept being visible due to the `visibility: visible`. Moving the cursor out of the list properly hides it, and it won't reappear, as there'd be nothing left to hover, and triggering the “actions” via keyboard won't cause this issue (well, unless you'd also hover on the list items).

Here is how the CSS responsible for hiding/showing items looks like for this example:

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

We can see how this behavior could be problematic on dynamic sites — and cases like this is something I encountered in my practice multiple times. The fixes for this — as soon as we'd identify them — are pretty simple though.

### Hide-only Selectors

Easiest way to make “restoring” visibility not to cause bugs is to not ever restore anything! Here how we can change the above CSS:

```CSS
.example--hide-only a:not(:hover, :focus) + ul:not(:hover, :focus-within) {
  visibility: hidden;
}
```

What we're doing is “inverting” the logic for the rule that previously did revert the visibility, and only use one rule to hide the content, listing the exact conditions for this. Here is the example fixed by this method:

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

While I'd argue that when we can write one rule that does the job properly right away we should do it, sometimes we cannot modify a selector, or doing so would be inconvenient for some reason (selector could be too complex, etc). Can we keep the “hiding” and “showing” rules separate,  restoring the `visibility` via an override, but without this override causing problems?

Sure, we can! It is actually quite simple: all we need to do is to use the `inherit` value!

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

[^not-initial]: Note how this is different from `initial` — because `visibility` is _inherited_, and its initial value is `visible`, then setting it to `initial` on a non-root element would actually make it be `visible`, so we cannot use it the same way as `inherit`. <!-- span="3" -->

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

There is a low chance this would be useful to anyone now, unless we'd travel to the past somehow, and then would be forced to write CSS for IE6… but anyway!

If we'd look at [“Can I Use…” for the global `inherit` keyword](https://caniuse.com/mdn-css_types_global_keywords_inherit), we will see that it was not supported for IE6-7… But you know what? The `visibility: inherit` method _did actually work_ in IE6! All because it did apply an _unknown_ value instead of falling back to the previously valid one, and treated the unknown `inherit` as the implicit _initial_ one, conveniently working as intended!

### Using CSS Variables

But what if we would actually have a case, where we'd want to use `visibility: visible` as a way to restore visibility inside some `hidden` context? And then we would still want to hide everything inside some other context with `visibility: hidden` on it?

Let's say we'd modify our last fixed example, but this time we would add an element to the start of each list item that must[^yeah] be visible even when the items are not hovered:

[^yeah]: I know, this exact example doesn't make much sense, but in practice there can be cases where we'd want to keep something `visible`, so let's just go with this example anyway haha. <!-- offset="1" span="2" -->

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

We can see that in this case we get a broken result when we click[^accessible-bug] on any of the items, where the added ellipsis pseudo-elements are visible even when we hide the parent. Here is how we show them in the first place:

[^accessible-bug]: This time, the bug reproduces even with keyboard navigation — such an accessible bug!

```CSS
.example--with-visible-items ul a::before {
  content: "…";
  visibility: visible; /* This can lead to a bug */
}
```

- We couldn't use `inherit` here, as we _need_ to break from the parent `<ul>`'s visibility in this case.
- We can't use the “inverted” method in abstract — we could use it for _some_ cases, where we know exactly the structure of our HTML, so we could target the conditions at which we need to hide everything, but this is far from practical.

However, if we're responsible to setting `visibility` everywhere, we can use CSS variables to achieve this! Look at this:

```CSS
.example--with-visible-items ul a::before {
  content: "…";
  visibility: var(--visibility-override, visible);
}
```

Instead of setting the `visible` value right away, we can use an intermediate CSS variable, which would basically provide an API that other components could use in order to hide this element on demand. This means that we'd only need to modify the place that applies the `visibility: hidden` in order to hide _everything_, adding `--visibility-override: hidden` to it alongside a regular `visibility`.

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

CSS variables are very powerful, and allow us to fix problems that could not be fixed in other ways (or would require much more complex and less reliable and maintainable code) — this is just another proof of that.

## Conclusion

In the end, I'd really recommend, every time you see a `visibility: visible` in your or your colleagues' code, try to understand what the code is trying to do, and either:

- Invert the logic, only using one rule with the `visibility: hidden`.
- Replace the `visible` with `inherit` is the goal is to restore visibility.
- If the element _must_ be `visible`, instead of setting the value right away, use it as the value to a CSS variable, providing an API for your component that other componets could use in order to reliably hide your element anyways.

Maybe it would also worth it introducing a [stylelint] rule prohibiting just the `visibility: visible` variant, while allowing `inherit` or usage as a part of CSS variables fallback!

And, as a last note — these methods could potentially be applied to other similar cases, basically for most inherited properties — `color`, `font-size` (think of `font-size: 0;`), `pointer-events` and others. And the overall “inverted selectors” method instead of overrides, as well as providing CSS variables API for some of the properties that could get in the way of other components, are both universal enough to just put them into your toolbox regardless of if you have these cases with visibility or other inherited properties.

## Aknowledgements

https://www.scottohara.me/blog/2017/04/14/inclusively-hidden.html