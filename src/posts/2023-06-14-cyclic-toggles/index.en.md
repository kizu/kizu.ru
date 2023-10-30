---
mastodon_post_id: "110541757216108825"
---

# Cyclic Dependency Space Toggles

#CSS_Variables #CSS_Logic #Style_Queries #Experiment #Practical #CSS

_Over the past few years, I wanted to be able to select a value from a list in CSS by toggling a single custom property. We have the “space toggle” for booleans, and hopefully, one day, we’ll get style queries, but what about today? In this article, I present you with the technique I recently discovered._

## The Technique

Let me start[^credits] by showing you the code, and then I will explain the technique (which I would refer to as “Cyclic Toggles”). Look:

[^credits]: All this builds up on the famous “space toggle” technique, alongside other inspirations — I’ll talk about them [later in the article](#was-this-always-possible). <br/><br/>The experiments that led to this technique came after [CSSDay](https://cssday.nl/2023), where there was a lot of excitement about the potential of style queries. I’ll write up about this in more detail in one of my future articles. <!-- span="2" -->

```CSS
.info {
  --level: var(--level--default);

  --level--default: var(--level,);
  --level--success: var(--level,);
  --level--warning: var(--level,);
  --level--error:   var(--level,);

  background:
    var(--level--default, lavender)
    var(--level--success, palegreen)
    var(--level--warning, khaki)
    var(--level--error,   lightpink);
}
```

This CSS would give the `.info` a default of a `lavender` background. If we’d set the `--level: var(--level-success)` on this element, no matter where[^some-limitations]: in HTML as an inline style or in CSS via a state or query override, we’d get it to be `palegreen`.

[^some-limitations]: The only way we cannot set the value is via inheritance — I’ll talk about [this method’s limitations](#limitations) later. <!-- offset="2" span="2" -->

Here is a live example with the above code that sets the `--level` variable on the elements in different ways:

{{<Partial src="examples/cyclic-toggles-1.html" />}}

The only thing we added regarding the logic is this:

```CSS
:checked + * + * > .info:first-child {
  --level: var(--level--success);
}
.info-states {
  --level: var(--static);
}
.info-states.info:hover {
  --level: var(--hover);
}
```

And then here is the corresponding HTML:

```HTML
<input
  type="checkbox"
  id="e1-checkbox"
/><label for="e1-checkbox"> Check me</label>
<div class="example-1">
  <div class="info"></div>
  <div
    class="info"
    style="--level: var(--level--success)"
  ></div>
  <div class="info info-states" style="
    --static: var(--level--warning);
    --hover: var(--level--error);
  "></div>
</div>
```

We can see how we can use different methods to “pass” the value to our toggle variable: a CSS state based on a pseudo-class, as an inline style, and even passing it through an additional API level.

We’re not limited by a single property, we can set as many as we want, and we could do the same on the descendants or pseudo-elements:

{{<Partial src="examples/cyclic-toggles-2.html" />}}

Here we did add a `border-radius` and `content` for the pseudo-element “listening” to the same state, alongside some additional static visual styles.

```CSS
.example-2 .info {
  border-radius:
    var(--level--default, 0.5rem)
    var(--level--success, 2.5rem)
    var(--level--warning, 0)
    var(--level--error,   0);
  transition: all 0.5s;
}

.example-2 .info::before {
  content:
    var(--level--success, "\2705 ")        /* ✅ */
    var(--level--warning, "\26A0 \FE0F ")  /* ⚠️ */
    var(--level--error,   "\26D4 \FE0F "); /* ⛔️ */
}
```

And here we are, being able to switch the state through multiple options by toggling a single variable. But…

### What is Going On?

When I first discovered this, I could not believe that it worked and that it _looked_ that simple. But if you did try to follow the logic of what is happening, you could have noticed one thing.

The cyclic dependency.

Let’s look at the first two declarations of our first code example:

```CSS
--level:          var(--level--default);
--level--default: var(--level,);
```

Wait a minute… Did we set `--level` to `--level--default`, and then… set `--level--default` to the `--level`? Isn’t that… invalid?

Yes, it is! When we are cross-referencing custom properties like this, both variables become[^def-invalid] [“guaranteed-invalid value”](https://www.w3.org/TR/css-variables-1/#guaranteed-invalid).

[^def-invalid]: I would refer to it through the article as `invalid` for convenience. <!-- offset="1" span="3" -->

Here is a quote from [the specs](https://www.w3.org/TR/css-variables-1/#cycles):

> […] This can create cyclic dependencies where a custom property uses a `var()` referring to itself, or **two or more custom properties each attempt to refer to each other**.
>
> If there is a cycle in the dependency graph, all the custom properties in the cycle are invalid at computed-value time.

And that behavior is what we want! Let’s now look at the rest of our custom property definitions:

```CSS
--level--success: var(--level,);
--level--warning: var(--level,);
--level--error:   var(--level,);
```

The `--level` here is `invalid`, which means that all three variables should skip to their fallback values, but the only thing we can see is the trailing commas — unlike the “space toggle”, in the case of the custom property fallbacks we can omit the space[^omit-the-space], and get the same effect in the end. Let me quote [the specs](https://www.w3.org/TR/css-variables-1/#using-variables) again:

[^omit-the-space]: It makes the technique more robust: not relying on the whitespace makes it safer for CSS minifiers. <!-- offset="3" span="2" -->

> […] a bare comma, with nothing following it, must be treated as valid in `var()`, indicating an empty fallback value.
>
> > Note: That is, `var(--a,)` is a valid function, specifying that if the `--a` custom property is invalid or missing, the `var()` should be replaced with nothing.

At this point, we have `--level--default` as an `invalid` (due to us cross-referencing it with the `--level`), and the rest of the properties are valid “nothings”[^def-nothing].

[^def-nothing]: I would refer to the space/nothing value through the article as `nothing` for convenience. <!-- offset="2" span="3" -->

Finally, we can look at any of our regular property declarations:

```CSS
background:
  var(--level--default, lavender)
  var(--level--success, palegreen)
  var(--level--warning, khaki)
  var(--level--error,   lightpink);
```

Three of the variables here do not produce anything but are valid and are not skipping to their fallbacks. And our `--level--default` is `invalid`, proceeding to the fallback and applying its value.

If we’d re-assign the `--level` to another variable, like a `--level--success`, then the `--level--default` would become the one resulting in `nothing`, and the `--level--success` gets an `invalid` value, resulting in our declaration switching from one value to another.

And that’s it!

### Multi-Select

Wait, but do we need to stop at toggling a single value via our cyclic toggle?

{{<Partial src="examples/cyclic-toggles-multiple.html" />}}

Here is the code for the logic in this example:

```CSS
.with-some-toggles {
  --is-round:   var(--toggles,);
  --is-pink:    var(--toggles,);
  --has-shadow: var(--toggles,);

  border-radius: var(--is-round, 50%);
  background:    var(--is-pink,  pink);
  box-shadow:    var(--has-shadow,
    5px 5px 2px 4px var(--THEME_BG--DISTANT)
  );
}
```

```HTML
  <div class="with-some-toggles" style="
    --toggles: var(--is-pink);
  "></div>
  <div class="with-some-toggles" style="
    --toggles: var(--is-round) var(--is-pink);
  "></div>
  <div class="with-some-toggles" style="
    --toggles: var(--is-round) var(--has-shadow);
  "></div>
  <div class="with-some-toggles" style="
    --toggles:
      var(--is-round)
      var(--is-pink)
      var(--has-shadow);
  "></div>
```

By mentioning multiple values for our cyclic toggles, we make each of them `invalid`, allowing toggling multiple space toggles at once from a single custom property. How cool is that?

* * *

The rest of the article can be considered optional — I would delve into the history of the space toggle itself, logic gates, and use cases.

### Was This Always Possible?

CSS Variables were available to use in all major versions of browsers [from like 2016](https://caniuse.com/css-variables) — how did no one[^no-one] find this technique before? Likely, because this did not work until recently!

[^no-one]: I did a lot of research, hoping to find something to refer to, but I could not find anything. If you did write about this technique at any point — let me know, and I would be happy to credit you. <!-- span="3" offset="1" -->

I did try to get to the root of it, and I’ll try to present you with an approximate timeline of events as I see it. This technique would not be possible without the past achievements of other people[^additionally] — we should be grateful for all the advancements, experiments, and shared knowledge that did lead to me discovering this technique in one way or another.

[^additionally]: Additionally, I want to mention [this post on mastodon](https://front-end.social/@johannes/110518841237350717) by [Johannes Odland](https://front-end.social/@johannes), where he gave me a helpful push towards experimenting with the space toggles.<br/><br/>I was planning on doing this anyway, but who knows if I would get to it, or if the circumstances would be such that all the inspiration from the just finished [CSSDay](https://cssday.nl/2023) alongside this push did combine into something bigger.<br/><br/>If you’d be afraid to speak out, know: sometimes small things matter. Your engagement and interest could help someone to get that extra [spoon](https://en.wikipedia.org/wiki/Spoon_theory). <!-- offset="-2" span="2" -->


- **December 3, 2015,** — “CSS Custom Properties for Cascading Variables Module Level 1” becomes a Candidate Recommendation for the first time (see the [complete history](https://www.w3.org/standards/history/css-variables-1) of the specification).
- In **2016** developers started experimenting with custom properties as they began [landing in most browsers](https://caniuse.com/css-variables). For example, I published my first article about custom properties — [“Conditions for CSS Variables”](/conditions-for-css-variables/) on October 21, 2016.
- At least starting from **2017** developers began stumbling over the “space toggle” technique in different forms.
    - [Ana Tudor](https://thebabydino.github.io/) used it for [her flags demo](https://codepen.io/thebabydino/pen/RgQwKq/?editors=0100) (mixed with SCSS, pen created on June 29, 2017).
    - [Jane Ori](https://propjockey.io/about/) independently came up with this trick [in April 2020](https://github.com/propjockey/css-sweeper#space-toggle-has-been-independently-discoverd-a-handful-of-times) and [wrote about it](https://web.archive.org/web/20230000000000*/https://twitter.com/Jane0ri/status/1282303255826046977) on July 12, 2020, naming it the “space toggle”.
    - [David Khourshid](https://davidk.dev/) [committed code using this technique](https://github.com/davidkpiano/propelcss/blob/master/index.css#LL684C4-L684C4) on June 21, 2020 and [wrote about it](https://web.archive.org/web/20230000000000*/https://twitter.com/DavidKPiano/status/1284155737720205313) on July 17, 2020, naming it “prop-and-lock”.
    - [Lea Verou](https://lea.verou.me/about/) did also discover this independently and wrote her article that popularized the technique — [“The -​-var: ; hack to toggle multiple values with one custom property”](https://lea.verou.me/2020/10/the-var-space-hack-to-toggle-multiple-values-with-one-custom-property/) on October 12, 2020 (this is where I got to know this technique).
- **July 28, 2020,** — [Jane Ori](https://propjockey.io/about/) did open an impactful [“Substitution of invalid variables into other variables”](https://github.com/w3c/csswg-drafts/issues/5370) CSSWG issue.

    This issue proposed the changes to the specs that would result in the behavior that unlocked this technique. I won’t paraphrase its text — if you’re curious about the particularities of it, I recommend reading the issue and its comments.
- **January 7, 2021,** — [Anders Hartvoll Ruud](https://github.com/andruud), who did participate in that issue, sent an [“Intent to Spec, Implement & Ship: CSS Variables: Persistent guaranteed-invalid values”](https://groups.google.com/a/chromium.org/g/blink-dev/c/0xrbzYe_vxU/m/52xVJHTICQAJ?pli=1) to Chromium.
- From the end of **2021** to the middle of **2022** the changes corresponding to the specs change started to land[^land] in the major browsers.
- **October 3, 2022,** — [Jane Ori](https://propjockey.io/about/) wrote a fascinating article — [“CSS-Only Type Grinding: Casting Tokens (sm|md|etc) into Useful Values”](https://www.bitovi.com/blog/css-only-type-grinding-casting-tokens-into-useful-values). I cannot claim that I understood all of its nuances, but since reading it, I wondered if there could be a simple way to achieve the same effect.
- **June 14, 2023,** — I’m publishing this article you’re reading now.

[^land]: It is hard for me to pinpoint when it appeared in Safari: in my testing, I found that it appeared in it somewhere from September 20, 2021 (v14.1, not working) to July 20, 2022 (v15.6, working). Firefox supported this from around September 7, 2021 (v92), and Chrome from at least March 1, 2022 (v99). If you know any more precise dates here, let me know! <!-- offset="-8" span="2" -->

As we can see, the spec changes allowing this did land at the end of 2021, and all browsers implemented them during 2022 — there is a chance you did your experiments trying to achieve this technique before that and went away with nothing.

## Space Toggles Logic

The best aspect of the cyclic toggles is that for each value, they produce a regular “space toggle”: at every point, every variable is either `invalid` or `nothing`.

Even the toggle variable itself can be a space toggle: we did have a default value in the above examples, but what if we would set it to `nothing`? Then it would be valid and thus would pass its value to all the value variables that depend on it, making both the cyclic toggle and all its values to be `nothing`, allowing the creation of logic based on any of them.

We can _almost_ produce [logic gates](https://en.wikipedia.org/wiki/Logic_gate) for our space toggles: we can use logic[^or-skip] to return final values, but the main issue is that due to the inability to _invert_ a “bit” stored in the space toggle, we cannot make a logic gate that outputs a space toggle itself.

[^or-skip]: Feel free to skip until the [“fallback values”](#fallback-values) section if you don’t want to get into CSS binary logic. <!-- offset="1" span="2" -->

Here is an example that uses our logic gates to compute the backgrounds for each cell.

{{<Partial src="examples/cyclic-toggles-logic-gates.html" />}}

The HTML for each row looks like this:

```HTML
<tr style="--A: var(--OFF); --B: var(--OFF);">
  <td class="A">0</td>
  <td class="B">0</td>
  <td class="AND">0</td>
  <td class="NAND">1</td>
  <td class="OR">0</td>
  <td class="NOR">1</td>
  <td class="XOR">0</td>
  <td class="XNOR">1</td>
</tr>
```

For each row, we set the `--A` and `--B` variables to one of two values space toggles can accept, and then for each cell in each column, we calculate the background based on them.

### Buffer and an Impossible Inverter

In “logic gates” terms, we can create a “buffer”, but not[^not-an-inverter] an “inverter”. However, for the “buffer”, we can define the outcome for both branches of a condition, allowing us to utilize the “not” branch. Here is how it works:

[^not-an-inverter]: Unless the final value we want to get is an integer. Then we could use the buffer to convert the input to `1` or `0` and use arithmetic operations. If you want to read more about them (and their use cases), I recommend [“Logical Operations with CSS Variables”](https://css-tricks.com/logical-operations-with-css-variables/) by [Ana Tudor](https://thebabydino.github.io/). <!-- span="2" -->

```CSS
.A {
  --TRUE: palegreen;
  --FALSE: lightpink;

  --NOT-A:    var(--A)              var(--FALSE);
  background: var(--A, var(--TRUE)) var(--NOT-A,);
}
```

We can see that, to have both values, we need to declare an intermediate variable, where we put our `--FALSE` value.

Let us calculate this manually for both states of the `--A`:

1. If `--A` is `invalid`, then
    - `--NOT-A` variable becomes [“invalid at computed-value time”](https://www.w3.org/TR/css-variables-1/#invalid-at-computed-value-time) due to its declaration containing a guaranteed invalid value.
    - `var(--A, var(--TRUE))` uses the fallback, outputting the value of `--TRUE`.
    - `var(--NOT-A,)` uses the empty fallback, outputting `nothing`.
    - Combining the two, we get `var(--TRUE)` and `nothing`, which results in `var(--TRUE)`.
    - We have `palegreen` in the end.
2. If `--A` is `nothing`, then
    - `--NOT-A` variable becomes `nothing` and `var(--FALSE)`, returning the `--FALSE` value.
    - `var(--A, var(--TRUE))` does not use the fallback and outputs `nothing`.
    - `var(--NOT-A,)` gets the value from the `--NOT-A`, which is `--FALSE`.
    - We have `lightpink` in the end.

We cannot[^without-type-grinding] have an “inverter” here because we have to use _valid_ values for both `--FALSE` and `--TRUE` for a buffer for things to not break. When the values are valid, like the colors for the `background`, things work. But what if the `--FALSE` or `--TRUE` would represent two different space toggle values?

[^without-type-grinding]: I think we can if we would use `@property` and [“CSS-Only Type Grinding”](https://www.bitovi.com/blog/css-only-type-grinding-casting-tokens-into-useful-values) technique by [Jane Ori](https://propjockey.io/about/), but at the time of writing this article `@property` is not supported in Firefox. <!-- span="2" -->

To have an “inverter”, we would want to set `--TRUE` to `nothing` and `--FALSE` to `invalid`. Let’s look at what would happen to our code in this case:

```CSS
.A {
  --TRUE: ;         /* nothing */
  --FALSE: initial; /* invalid */

  --NOT-A:  var(--A)              var(--FALSE);
  --OUTPUT: var(--A, var(--TRUE)) var(--NOT-A,);
}
```

1. If `--A` is `invalid`, then
    - `--NOT-A` has both `--A` and `--FALSE` as `invalid`, returning `invalid`.
    - `var(--A, var(--TRUE))` uses the fallback, outputting the value of `--TRUE`, which is `nothing`.
    - `var(--NOT-A,)` uses the empty fallback, outputting `nothing`.
    - We have `nothing` in the `--OUTPUT`. So far, so good?
2. If `--A` is `nothing`, then
    - Oops, `--NOT-A` is still `invalid`, because we have the `--FALSE` as an invalid value, which makes the whole declaration `invalid` at computed-value time.
    - `var(--A, var(--TRUE))` does not use the fallback and outputs the value of `--A`, which is `nothing`.
    - `var(--NOT-A,)` tries to get the value from the `--NOT-A`, which, as we found out, is `invalid`, going to the fallback and outputting `nothing`.
    - Both parts have `nothing` in the end.

Regardless of what we put into our equation here, we get `nothing`, making it impossible to make an inverter.

### AND, NAND, OR, NOR, XOR, XNOR

We can also use valid CSS values for all other logic gates. But not the space toggles. As we could later see from an `XOR` example, we can chain our gates, but this leads to us having to repeat the values for multiple branches, and I’m not sure this is viable or if we can extend it to longer chains.

In the end, both `NOR` and `XNOR` are “fake” as we end up flipping which value we’re using in which case, which works for regular values.

I won’t go deep into the details of their implementation but will show the code for them.

<details>
<summary class="Link Link_pseudo">Full CSS for the table example’s logic</summary>

{{<Partial src="examples/cyclic-toggles-logic-gates.html" />}}

```CSS
.example-logic-gates {
  --_: var(--_);
  --ON: var(--_);
  --OFF: var(--_,);

  --TRUE: palegreen;
  --FALSE: lightpink;
}

.A {
  --NOT-A: var(--A) var(--FALSE);
  background:
    var(--A, var(--TRUE))
    var(--NOT-A,);
}
.B {
  --NOT-B: var(--B) var(--FALSE);
  background:
    var(--B, var(--TRUE))
    var(--NOT-B,);
}
.AND {
  --A-AND-B: var(--A, var(--B));
  --A-NAND-B: var(--A-AND-B) var(--FALSE);
  background:
    var(--A-AND-B, var(--TRUE))
    var(--A-NAND-B,);
}
.NAND {
  --A-AND-B: var(--A, var(--B));
  --A-NAND-B: var(--A-AND-B) var(--TRUE);
  background:
    var(--A-AND-B, var(--FALSE))
    var(--A-NAND-B,);
}
.OR {
  --A-OR-B: var(--A) var(--B);
  --A-NOR-B: var(--A-OR-B) var(--FALSE);
  background:
    var(--A-OR-B, var(--TRUE))
    var(--A-NOR-B,);
}
.NOR {
  --A-OR-B: var(--A) var(--B);
  --A-NOR-B: var(--A-OR-B) var(--TRUE);
  background:
    var(--A-OR-B, var(--FALSE))
    var(--A-NOR-B,);
}
.XOR {
  --A-AND-B: var(--A, var(--B));
  --A-OR-B: var(--A) var(--B);
  --A-NOR-B: var(--A-OR-B) var(--FALSE);
  --A-NAND-B:
    var(--A-AND-B)
    var(--A-OR-B, var(--TRUE))
    var(--A-NOR-B,);
  background:
    var(--A-AND-B, var(--A-OR-B, var(--FALSE)))
    var(--A-NAND-B,);
}
.XNOR {
  --A-AND-B: var(--A, var(--B));
  --A-OR-B: var(--A) var(--B);
  --A-NOR-B: var(--A-OR-B) var(--TRUE);
  --A-NAND-B:
    var(--A-AND-B)
    var(--A-OR-B, var(--FALSE))
    var(--A-NOR-B,);
  background:
    var(--A-AND-B, var(--A-OR-B, var(--TRUE)))
    var(--A-NAND-B,);
}
```
</details>

A few notes:

- I’m using the “`--_`” variable set to itself, demonstrating how to get both the `--ON` and `--OFF` from a cyclic dependency variable. This way, we can have the same space toggle, but more reliable due to it not containing the space that minifiers could accidentally remove.
- `AND` gate is us chaining our variables through fallbacks.
- `OR` lists our space toggles without fallbacks: it would produce `nothing` if both variables are `nothing`. Otherwise, it would end up being `invalid`.
- For `XOR`, I’m doing `OR(AND, NOR)`, which can be complex due to the inability to return the bits from our imperfect logic gates. We have to define our `--FALSE` in two places — we can see how chaining our gates bump the complexity of our code.
- We could simplify almost every example if we do not need to apply the “not” branch — if we’re ok with the CSS property being `invalid` or `nothing`, then we could omit certain parts.

### Fallback Values

Another interesting case is when we want to set a _default_ value for a toggle if it is not defined. Let’s modify our example and make the `--border` toggle have default values based on the `--level` but still allow us to override it:

{{<Partial src="examples/cyclic-toggles-fallback.html" />}}

In HTML, we can set the `--border` explicitly on the first element and let the rest have it based on the `--level`:

```HTML
<div class="info" style="--border: var(--border--thick);"></div>
<div
  class="info"
  style="--level: var(--level--success)"
></div>
<div class="info info-states" style="
  --static: var(--level--warning);
  --hover: var(--level--error);
"></div>
```

```CSS
.example-fallback .info {
  --border: var(--_,);
  --border--none: var(--border,);
  --border--thin: var(--border,);
  --border--thick: var(--border,);

  --_border-fallback:
    var(--border)
    var(--level--default, 0)
    var(--level--success, 0)
    var(--level--warning, 1px)
    var(--level--error,   10px);

  border: solid
    var(--_border-fallback,)
    var(--border--none, 0)
    var(--border--thin, 1px)
    var(--border--thick, 10px);
  }
```

Here we can see:

1. I’m using an undefined `--_` variable to initialize the `--border` to `nothing`.
2. We define a `--_border-fallback` that uses the `--border` and any fallback values (it could be static or, as in the example above, — based on other cyclic toggles).
3. When the `--border` is `nothing` (as in — initially), all its values become `nothing` as well, but not via a fallback, but by using its valid value, and the `--_border-fallback` would return its value.
4. If we’d set the `--border` to one of its values, it becomes `invalid`, making the `--_border-fallback` `invalid` and changing it to _nothing_ in our result, at the same time “enabling” one of its values that we did set.

In the end, we can have optional toggles with values dependent on other toggles.

## Do We Still Need Style Queries?

If this method is so simple and powerful, allowing us to use a single custom property to toggle between multiple states of multiple elements, would [style queries](https://www.w3.org/TR/css-contain-3/#style-container) be redundant?

Short answer: no, of course, style queries would be indispensable; **give them to me now**.

A longer answer will be in one of my future articles.

Fun fact: the technique in this article came from my experiments with the style queries alternatives. I would write about how it compares to them and to other ways we can work around their absence. Stay tuned!

In the meantime, the limitations that I will be talking about in the next section could hint at how this is not the perfect solution, and there would be a lot of cases where style queries would be much better in almost every aspect.

## Limitations

This list is not complete — this technique is new, making it possible for us to stumble upon other cases where it would have issues. If you encounter any — let me know, and I will update the article.

### Inheritance

The main limitation, as I see it, is that if we want to make our cyclic toggle work properly, we have to initiate all the custom properties for the values on the same element as the toggle variable itself.

The explanation comes from the way cyclic dependencies work. Let me quote [the specs](https://www.w3.org/TR/css-variables-1/#ref-for-custom-property%E2%91%A0%E2%91%A8):

> In general, cyclic dependencies occur only when multiple custom properties on the same element refer to each other; custom properties defined on elements higher in the element tree can never cause a cyclic reference with properties defined on elements lower in the element tree.

We have to define everything on the same element, but then we would be free to toggle any of the initiated values via a single custom property. The computed value of our toggle would still propagate to the children, allowing us to adjust the styles of any number of properties on any number of nested elements (unless they redefine all these variables).

This limitation makes for a more strict API, which can be good. However, we need to keep it in mind, as with the regular space toggle (if we were using it for “turning a value on/off”), we could override it on any level.

Style queries would be much more powerful as we could apply them from anywhere via inheritance.

### Animations

We cannot toggle a cyclic toggle inside an animation because that would lead to _all_ the values becoming [“animation-tainted”](https://www.w3.org/TR/css-variables-1/#animation-tainted) and thus rendering invalid.

### Naming

Because we have to initiate each possible value as a custom property, there could be a potential for name clashes. That’s why, in my first example, I used BEM-like notation for the values: `--level--default` instead of `--default`. While the latter could be used for simple cases, as soon as we want to add a second cyclic toggle, the names could potentially clash.

That is another place where style queries would be superior, as they would allow us to target any custom idents for the custom properties they belong to.

## Use Cases

If I would try to come up with a lot of examples, I would never finish this article, and I really, _really_ want to share this technique with you now. However, just as a simple list:

- Any theming which involves choosing between more than 2 themes, like having not just dark & light themes, but more variations. With space toggle we can implement a robust system for just toggling between two alternatives, but with this technique we can implement any number of exclusive[^or-intersecting] themes.
- Component API — this technique perfectly works when isolated to a component. Its limitation is, in one way, a strength: not being able to override parts of it makes the API more rigid but more reliable, with less space for hacks.
- Anything else you could want to use space toggles but was limited by 2 values.

[^or-intersecting]: Or intersecting — see the [multi-select](#multi-select) example. <!-- offset="4" -->

There is a chance I will update this section later when I find other good uses for this technique — or you can send me your experiments with it, and I would be happy to add them here. I can’t wait to see what you would come up with!

## Final Words

I hope you did find this technique as fascinating as I did and my explanations in the article helpful! I started writing it as soon as I discovered this technique, and there are still places I could improve, but my goal was to share my findings first.

Note that I did not yet use this technique in production (unlike regular space toggles, which work perfectly fine) — if you would try to apply it to your project, be sure to test things extensively.

I cannot wait until I’ll find an excuse to try it for something not critical and see how it could simplify the code for complex cases.

The last thing I’d want to mention once again: this technique won’t be possible without people participating in the community — writing articles, coming up with weird experiments, creating[^search-first] issues in [CSSWG GitHub](https://github.com/w3c/csswg-drafts/issues) — all this contributes to our shared knowledge and the advancements of CSS.

[^search-first]: Please, search first before opening them, and if you find something similar to your request — it would be better to comment there. And don’t post “+1” — there are emoji reactions, and if you want to give your input, it would be more helpful to list your use cases and struggles. <!-- span="4" offset="2" -->

If you ever found something interesting — share it. And if you want a particular feature — request and advocate for it.

Even if you do not succeed at a particular point, you could write about what you wanted to achieve and see if others would pick it up.

And then, one day, there is a chance your original idea will become a reality.
