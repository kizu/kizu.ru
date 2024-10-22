---
mastodon_post_id: ""
---

# Possible Future CSS: Tree-Counting Functions and Random Values

#TreeCountingFunctions #RandomValues #Future_CSS #Experiment #CSS

_Many exciting things were added to CSS specs over the years, but some have yet to be implemented by browser engines. In this article, I spotlight two features from Level 5 of the CSS Values and Units Working Draft, describe how we can prototype them with what we have in CSS today, and provide several interactive demos of their use cases._


## The Introduction

Modern CSS can do many things that were only possible via verbose, manually written CSS, or with the help of CSS preprocessors. For a long time, we had [custom properties](https://drafts.csswg.org/css-variables/), and recently, we got [native nesting](https://drafts.csswg.org/css-nesting-1/). Some other features, like functions and mixins, are also planned, and [partially specified](https://drafts.csswg.org/css-mixins-1/).

<aside style="--span: 3">

Disclaimer: this article is rather long! I wanted to split it into two, but decided to release it as one. If you’re interested in playing with [the final interactive demo](#the-final-demo) — go straight to it. Here is a tiny static preview:

{{<Partial src="examples/use-case-cards-5-stack-mini.html" />}}

</aside>

Two other common preprocessor features — loops and randomness — could also be partially covered by CSS in the future. [The Working Draft of CSS Values and Units Module Level 5](https://www.w3.org/TR/css-values-5/) defines two features: [randomness](https://www.w3.org/TR/css-values-5/#randomness), and [tree counting functions](https://www.w3.org/TR/css-values-5/#tree-counting).

While these features won’t cover _all the things_ loops in preprocessors can do, many of their use cases could be handled by the tree-counting functions, and randomness could provide a great built-in way to achieve some variation in designs. And, as with many other native CSS features, both could go beyond what is possible with the preprocessors, leveraging the dynamic powers of everything we already have in CSS — cascade, custom properties, animations, and so on.

I’ll start by introducing what is currently described in the specs. Later, I will present many interactive demos, in which I will prototype things using today’s means.


## The Specs

As I’m writing it, no browser has implemented (or, from what I know, started to prototype) what is present in these specs, so everything could change in the future from what I describe.

Both features here are part of the [CSS Values and Units Module Level 5 specification](https://www.w3.org/TR/css-values-5/), which also describes many other wonderful things — feel free to explore them yourself (and I might return to some of them one day).


### Tree-Counting Functions

Did you ever want to get the index of some element inside its parent, or count how many elements there are — and use those as numbers in calculations?

A CSSWG issue by [Adam Argyle](https://nerdy.dev/): [“Proposal: add `sibling-count()` and `sibling-index()`”](https://github.com/w3c/csswg-drafts/issues/4559) was adopted by CSSWG, and became a part of the specs as its [“Tree Counting Functions: the `sibling-count()` and `sibling-index()` notations”](https://www.w3.org/TR/css-values-5/#tree-counting) section.

The proposal itself has roots in many other discussions and requests from authors:

- [“Function to retrieve index of element among siblings, or counter on element as integer”](https://github.com/w3c/csswg-drafts/issues/1869) by [Sebastian Malton](https://github.com/Nokel81).
- [“Number-of-siblings pseudoclass proposal”](https://github.com/w3c/csswg-drafts/issues/1176) by [Jonathan Neal](https://jonneal.dev/).
- [“Enable the use of `counter()` inside `calc()`”](https://github.com/w3c/csswg-drafts/issues/1026) by [Giorgio Pretto](https://www.giorgiopretto.com/).

Many others participated in the above discussions (and in other places) as well, and there are hundreds[^use-cases-section], if not thousands, of various demos people create on the internet that use preprocessors to achieve this, so the interest in this feature is obvious.

[^use-cases-section]: See the [“Others”](#others) section of use-cases for a few links. <!-- offset="1" -->

The current specification about it is so brief, that I can quote it in full (omitting the notes):

> The `sibling-count()` functional notation represents, as an `<integer>`, the total number of child elements in the parent of the element on which the notation is used.
>
> The `sibling-index()` functional notation represents, as an `<integer>`, the index of the element on which the notation is used among the children of its parent. Like `:nth-child()`, `sibling-index()` is 1-indexed.
>
> When used on a pseudo-element, these resolve as if specified on its ultimate originating element.

One of the potentially planned features — the ability to specify a selector for the acceptable subset siblings — is not yet in the specs, but is present as a note[^selector-argument-issue].

[^selector-argument-issue]: And a CSSWG issue [“Extend `sibling-index()` and `sibling-count()` with a selector argument”](https://github.com/w3c/csswg-drafts/issues/9572) by [Oriol Brufau](https://github.com/Loirooriol). <!-- offset="2" span="3" -->

Another missing part is the ability to count not the _siblings_, but the _children_. I opened [a CSSWG issue about that](https://github.com/w3c/csswg-drafts/issues/11068), and provide a few examples of that use case further in this article.


### Random Values

A proposal by [Benjamin De Cock](https://github.com/bendc): [“`random()` function”](https://github.com/w3c/csswg-drafts/issues/2826) (and previously by [Tab Atkins-Bittner](https://xanthir.com/), who drafted the current specification) was adopted by CSSWG, and became a part of the specs as its [“Generating Random Values”](https://www.w3.org/TR/css-values-5/#randomness) section.

There has been a long discussion inside the issue, and the spec describes many nuances about how this should be implemented. After all, “randomness” is not the simplest concept.

The current spec defines two functions:

- [`random()`](https://www.w3.org/TR/css-values-5/#random) for getting a random value from a certain range, with an optional step value;
- [`random-item()`](https://www.w3.org/TR/css-values-5/#random-item) for picking a random value from a list.

The first one could be beneficial for calculations, and the second one could be a convenient shortcut for various effects, or for cases that can’t be covered by calculations (at least until we get [proper conditionals](https://lea.verou.me/blog/2024/css-conditionals/) in CSS).


## Prototyping with Custom Properties

There are many common ways developers assign a certain index to an element or add an element of randomness to their designs. Often, authors are doing so in HTML (generating it, and applying it as an inline style), via CSS (using a preprocessor, or manually writing down a long sheet of CSS rules that achieve it in a limited manner), or by JS (dynamically assigning CSS properties via a [mutation observer](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)).

As usual, for my experiments, I wanted to use CSS-only[^js-for-demos] way, without relying on preprocessors. Some of my workarounds are based on the work of others, although I did not find mentions of some specific improvements that I introduced. Please let me know if there are other sources I could link to, and I’ll update the article.

[^js-for-demos]: My demos contain some basic JS, but only for interactivity: adjusting the number of items, and toggling classes on and off.

Note that the keyword is “prototype”, and not a “workaround”: the selectors I will present, especially for the `sibling-count()` and `children-count()` functions, are far from being optimal, and could result in sluggish style recalculation — I won’t recommend using this in production. Assigning the index statically in HTML is the best way to do it if you need a performant solution.


### The `sibling-index()` Prototype

The goal of my prototype is to get the sibling’s index as a `--sibling-index` custom property, which could then be used in other calculations. We can’t do this for an unlimited number of elements, but we can achieve an acceptable result for any given number of items with a not-so-long list of rules.

I experimented with different ways of achieving this, eventually developing an algorithm I’ll present below. If you know how it could be further improved, I’m all ears!


#### The Algorithm

I’ll present the final code later, but let me describe how I got to it first.

Let’s say we want to assign[^assigning-index] a `--sibling-index` to the first nine items of some list. If we were to write it naively, it would consist of nine rules:

[^assigning-index]: In this and the following examples, we output the value of the `--sibling-index` as a counter, and have an ordered list with the counters, allowing us to compare that our index is assigned correctly.<br/><br/> Some places in the code could also be optimized, like replacing the `:nth-child(1)` with `:first-child` etc., but I left the repeated selectors for consistency. <!-- span="2" -->

```CSS
li:nth-child(1) { --sibling-index: 1 }
li:nth-child(2) { --sibling-index: 2 }
li:nth-child(3) { --sibling-index: 3 }
li:nth-child(4) { --sibling-index: 4 }
li:nth-child(5) { --sibling-index: 5 }
li:nth-child(6) { --sibling-index: 6 }
li:nth-child(7) { --sibling-index: 7 }
li:nth-child(8) { --sibling-index: 8 }
li:nth-child(9) { --sibling-index: 9 }
```

{{<Partial src="examples/algorithm-1.html">}}
In this and other examples, there are <label class="Link Link_pseudo" for="algorithm-1-range">controls</label> that use JS to provide interactivity: try using them!
{{</Partial>}}

This is not so bad for only nine rules, but what if[^out-of-bounds] we had a hundred — or even a thousand — of them?

[^out-of-bounds]: Increasing the number of items in the above example will show that these won’t get any `--sibling-index` assigned. Items that fall outside each example’s coverage will be highlighted in pink. <!-- span="3" -->

We could use a preprocessor to output a long list of these rules, but what if we could optimize it somehow, making manually writing a plain list of rules _tolerable_?

Here is an algorithm for doing so that I came up with:

> The number of rules we will need to assign a `--sibling-index` up to an `N - 1` number of items is `2 * sqrt(N) - 1`, or `2 * M - 1`, where `M = sqrt(N)` rounded up.
>
> The `--sibling-index` will be calculated based on two variables: `--si1` and `--si2`, where each will require an `M` number of rules:
>
> ```CSS
> li {
>   --si2: 0;
>   --si1: 0;
>   --sibling-index: calc(M * var(--si2) + var(--si1));
> }
> ```
>
> The first `M` number rules will be as follows, defining the `--si1`:
>
> ```CSS
> li:nth-child(Mn+1) { --si1: 1 }
> /* … */
> li:nth-child(Mn+(M-1)) { --si1: (M-1) }
> ```
>
> The second list of `M` rules will define the second part as `--si2`:
>
> ```CSS
> li:nth-child(n+M*1):nth-child(-n+(M*2-1)) { --si2: 1 }
> /* … */
> li:nth-child(n+(M*(M-1))):nth-child(-n+(M*M-1)) { --si2: (M-1) }
> ```
>
> Note how we define the default `0` values not as separate rules or fallback values, but as declarations — this ensures these values won’t be inherited if we use this technique for nested lists.

Let’s apply it to the above list of nine items: the `M` will be `sqrt(9)` which is `3`. So, to cover almost the same list of elements, we need `3 * 2 - 1 = 5` rules[^snippet-second-nth] — nearly a half, compared with the original nine:

[^snippet-second-nth]: Here and below, I do not omit the second negative `:nth-child` from the `--si2` calculation. We could skip it and rely on the order of the rules, with the later rules overriding the ones before, but that makes debugging slightly more awkward. In general, I prefer to select only what is required, and not rely on the overrides.<!-- span="3" offset="2" -->

```CSS
li {
  --si2: 0;
  --si1: 0;
  --sibling-index: calc(3 * var(--si2) + var(--si1));
}

li:nth-child(3n+1) { --si1: 1 }
li:nth-child(3n+2) { --si1: 2 }
li:nth-child(n+3):nth-child(-n+5) { --si2: 1 }
li:nth-child(n+6):nth-child(-n+8) { --si2: 2 }
```

{{<Partial src="examples/algorithm-2.html" />}}

Note how we did not cover our ninth element: our calculation, at its maximum value, will be `2 * 3 + 2 = 8`.

Of course, with `M = 3` this does not make much sense as a replacement for a hard-coded list of rules: the profit is just four rules! But the gains are exponential:

- With `M = 4`, instead of **15** rules, we’ll need only **7**.
- With `M = 10`, instead of **99** rules, we’ll need only **19**.
- With `M = 32`, instead of **1023** rules, we’ll need _only_ **63**.


#### Indexing 99 Siblings

Using the same algorithm, the snippet for covering up to 99 elements is brief enough[^maybe-open-props] to use in simple demos and prototypes:

[^maybe-open-props]: I can see something like that appearing in, for example, [Open Props](https://open-props.style/) — there is even [an issue about this](https://github.com/argyleink/open-props/issues/506) by [Michal Čaplygin](https://github.com/myfonj) already! <!-- offset="1" span="2" -->

```CSS
.count-99-items {
  & > li {
    --si2: 0;
    --si1: 0;
    --sibling-index: calc(10 * var(--si2) + var(--si1));
  }
  & > li:nth-child(10n+1) { --si1: 1 }
  & > li:nth-child(10n+2) { --si1: 2 }
  & > li:nth-child(10n+3) { --si1: 3 }
  & > li:nth-child(10n+4) { --si1: 4 }
  & > li:nth-child(10n+5) { --si1: 5 }
  & > li:nth-child(10n+6) { --si1: 6 }
  & > li:nth-child(10n+7) { --si1: 7 }
  & > li:nth-child(10n+8) { --si1: 8 }
  & > li:nth-child(10n+9) { --si1: 9 }
  & > li:nth-child(n+10):nth-child(-n+19) { --si2: 1 }
  & > li:nth-child(n+20):nth-child(-n+29) { --si2: 2 }
  & > li:nth-child(n+30):nth-child(-n+39) { --si2: 3 }
  & > li:nth-child(n+40):nth-child(-n+49) { --si2: 4 }
  & > li:nth-child(n+50):nth-child(-n+59) { --si2: 5 }
  & > li:nth-child(n+60):nth-child(-n+69) { --si2: 6 }
  & > li:nth-child(n+70):nth-child(-n+79) { --si2: 7 }
  & > li:nth-child(n+80):nth-child(-n+89) { --si2: 8 }
  & > li:nth-child(n+90):nth-child(-n+99) { --si2: 9 }
}
```

{{<Partial src="examples/algorithm-3-99.html" />}}


#### Indexing 1023 Siblings

Originally, I thought, hey, if we can split our index into two parts, surely we can do more? For counting a thousand items, could we get away with the `10 * 10 * 10` rules?

The problem is that inside the `:nth-child()` we have only one variable — `n`. And there is no way to select a _repeating range_ of elements via it, unless we try something like [“Christmas Tree Selector”](https://blog.kizu.dev/nth-sibling-christmas-tree/).

But it is far from optimal: with it, we’ll still need around 120 rules to cover 1000 elements, while my final algorithm for 1023 elements requires just 63 of them.

I’ll hide the code for the 1023 version and its demo under a `<details>` tag, as it is already _too much_: I don’t recommend opening it in a mobile Safari, for example. It might freeze.

<details>
<summary class="Link Link_pseudo">Code and Demo of counting up to 1023 items</summary>

```CSS
.count-1023-items {
  & > li {
    --si2: 0;
    --si1: 0;
    --sibling-index: calc(32 * var(--si2) + var(--si1));
  }
  & > li:nth-child(32n+01) { --si1:  1 }
  & > li:nth-child(32n+02) { --si1:  2 }
  & > li:nth-child(32n+03) { --si1:  3 }
  & > li:nth-child(32n+04) { --si1:  4 }
  & > li:nth-child(32n+05) { --si1:  5 }
  & > li:nth-child(32n+06) { --si1:  6 }
  & > li:nth-child(32n+07) { --si1:  7 }
  & > li:nth-child(32n+08) { --si1:  8 }
  & > li:nth-child(32n+09) { --si1:  9 }
  & > li:nth-child(32n+10) { --si1: 10 }
  & > li:nth-child(32n+11) { --si1: 11 }
  & > li:nth-child(32n+12) { --si1: 12 }
  & > li:nth-child(32n+13) { --si1: 13 }
  & > li:nth-child(32n+14) { --si1: 14 }
  & > li:nth-child(32n+15) { --si1: 15 }
  & > li:nth-child(32n+16) { --si1: 16 }
  & > li:nth-child(32n+17) { --si1: 17 }
  & > li:nth-child(32n+18) { --si1: 18 }
  & > li:nth-child(32n+19) { --si1: 19 }
  & > li:nth-child(32n+20) { --si1: 20 }
  & > li:nth-child(32n+21) { --si1: 21 }
  & > li:nth-child(32n+22) { --si1: 22 }
  & > li:nth-child(32n+23) { --si1: 23 }
  & > li:nth-child(32n+24) { --si1: 24 }
  & > li:nth-child(32n+25) { --si1: 25 }
  & > li:nth-child(32n+26) { --si1: 26 }
  & > li:nth-child(32n+27) { --si1: 27 }
  & > li:nth-child(32n+28) { --si1: 28 }
  & > li:nth-child(32n+29) { --si1: 29 }
  & > li:nth-child(32n+30) { --si1: 30 }
  & > li:nth-child(32n+31) { --si1: 31 }
  & > li:nth-child(n+032):nth-child(-n+063)  { --si2:  1 }
  & > li:nth-child(n+064):nth-child(-n+095)  { --si2:  2 }
  & > li:nth-child(n+096):nth-child(-n+127)  { --si2:  3 }
  & > li:nth-child(n+128):nth-child(-n+159)  { --si2:  4 }
  & > li:nth-child(n+160):nth-child(-n+191)  { --si2:  5 }
  & > li:nth-child(n+192):nth-child(-n+223)  { --si2:  6 }
  & > li:nth-child(n+224):nth-child(-n+255)  { --si2:  7 }
  & > li:nth-child(n+256):nth-child(-n+287)  { --si2:  8 }
  & > li:nth-child(n+288):nth-child(-n+319)  { --si2:  9 }
  & > li:nth-child(n+320):nth-child(-n+351)  { --si2: 10 }
  & > li:nth-child(n+352):nth-child(-n+383)  { --si2: 11 }
  & > li:nth-child(n+384):nth-child(-n+415)  { --si2: 12 }
  & > li:nth-child(n+416):nth-child(-n+447)  { --si2: 13 }
  & > li:nth-child(n+448):nth-child(-n+479)  { --si2: 14 }
  & > li:nth-child(n+480):nth-child(-n+511)  { --si2: 15 }
  & > li:nth-child(n+512):nth-child(-n+543)  { --si2: 16 }
  & > li:nth-child(n+544):nth-child(-n+575)  { --si2: 17 }
  & > li:nth-child(n+576):nth-child(-n+608)  { --si2: 18 }
  & > li:nth-child(n+608):nth-child(-n+639)  { --si2: 19 }
  & > li:nth-child(n+640):nth-child(-n+671)  { --si2: 20 }
  & > li:nth-child(n+672):nth-child(-n+703)  { --si2: 21 }
  & > li:nth-child(n+704):nth-child(-n+735)  { --si2: 22 }
  & > li:nth-child(n+736):nth-child(-n+767)  { --si2: 23 }
  & > li:nth-child(n+768):nth-child(-n+799)  { --si2: 24 }
  & > li:nth-child(n+800):nth-child(-n+831)  { --si2: 25 }
  & > li:nth-child(n+832):nth-child(-n+863)  { --si2: 26 }
  & > li:nth-child(n+864):nth-child(-n+895)  { --si2: 27 }
  & > li:nth-child(n+896):nth-child(-n+927)  { --si2: 28 }
  & > li:nth-child(n+928):nth-child(-n+959)  { --si2: 29 }
  & > li:nth-child(n+960):nth-child(-n+991)  { --si2: 30 }
  & > li:nth-child(n+992):nth-child(-n+1023) { --si2: 31 }
}
```

{{<Partial src="examples/algorithm-4-1023.html" />}}

</details>

The 99-element version is the best compromise — I will use only it in my later experiments.


### The `sibling-count()` Prototype

With the above algorithm, we can assign an index for any finite number of items with a rather compact list of rules. But, for now, every element knows only about its index — not about how many siblings it has. The `sibling-count()` function will provide this information, and we can build upon our `sibling-index()` prototype to achieve it.

#### Same as in the Spec

The specification defines the `sibling-count()` as something that counts _siblings_, and which is available to the siblings themselves. We can use [“Quantity Queries”](https://alistapart.com/article/quantity-queries-for-css/) to achieve this[^quantity-queries], although because it requires us to use the `:nth-last-child()` instead of the `:nth-child()`, we have to write a separate list of rules to cover the same range.

[^quantity-queries]: Term coined by [Heydon Pickering](https://heydonworks.com/), with previous work by [Lea Verou](https://lea.verou.me/) in [“Styling elements based on sibling count”](https://lea.verou.me/blog/2011/01/styling-children-based-on-their-number-with-css3/) post, and [“Clever lists with CSS3 selectors”](https://andr3.net/blog/post/142) by [André Luís](https://meet.andr3.net/). <!-- offset="2" span="2" -->

We will also use some nested selectors, so we will, essentially, quadruple the number of rules that were required before (even though we can write them down compactly enough thanks to native CSS nesting).

{{<Partial src="examples/sibling-count.html">}}
Note that unlike with the `--sibling-index`, with `--sibling-count` things will break if we go beyond what the selectors will cover.
{{</Partial>}}

Here we assign a `--sibling-count` on every `li` with a code very similar to what we had before:

```CSS
.count-99-siblings {
  & > li {
    --sc2: 0;
    --sc1: 0;
    --sibling-count: calc(10 * var(--sc2) + var(--sc1));
  }
  & > li:first-child {
    &:nth-last-child(10n+1) { &, & ~ li { --sc1: 1 } }
    &:nth-last-child(10n+2) { &, & ~ li { --sc1: 2 } }
    &:nth-last-child(10n+3) { &, & ~ li { --sc1: 3 } }
    &:nth-last-child(10n+4) { &, & ~ li { --sc1: 4 } }
    &:nth-last-child(10n+5) { &, & ~ li { --sc1: 5 } }
    &:nth-last-child(10n+6) { &, & ~ li { --sc1: 6 } }
    &:nth-last-child(10n+7) { &, & ~ li { --sc1: 7 } }
    &:nth-last-child(10n+8) { &, & ~ li { --sc1: 8 } }
    &:nth-last-child(10n+9) { &, & ~ li { --sc1: 9 } }
    &:nth-last-child(n+10):nth-last-child(-n+19)
      { &, & ~ li { --sc2: 1 } }
    &:nth-last-child(n+20):nth-last-child(-n+29)
      { &, & ~ li { --sc2: 2 } }
    &:nth-last-child(n+30):nth-last-child(-n+39)
      { &, & ~ li { --sc2: 3 } }
    &:nth-last-child(n+40):nth-last-child(-n+49)
      { &, & ~ li { --sc2: 4 } }
    &:nth-last-child(n+50):nth-last-child(-n+59)
      { &, & ~ li { --sc2: 5 } }
    &:nth-last-child(n+60):nth-last-child(-n+69)
      { &, & ~ li { --sc2: 6 } }
    &:nth-last-child(n+70):nth-last-child(-n+79)
      { &, & ~ li { --sc2: 7 } }
    &:nth-last-child(n+80):nth-last-child(-n+89)
      { &, & ~ li { --sc2: 8 } }
    &:nth-last-child(n+90):nth-last-child(-n+99)
      { &, & ~ li { --sc2: 9 } }
  }
}
```

These selectors do not rely on anything fancy, so if we expand the native nesting, the `:nth-last-child()` is generally [well-supported](https://caniuse.com/mdn-css_selectors_nth-last-child). Aside from a potential performance impact, they could work well enough even in production (but I won’t recommend them for it).

#### Using the Parent

Alternatively, instead of relying on the `:nth-last-child()`, we could directly build upon the rules that we did create for handling `--sibling-index` — if we will apply the `:has()` selector.

Instead of calculating `--sibling-count`, we’d calculate a `--children-count` on the parent, and inherit it to the children. The only thing we’d need to do is to add an extra[^ol-selector] `ol:has(>&:last-child) {}` rule inside our existing rules.

[^ol-selector]: It is time to note how I’m using the more specific selectors than you could think we could get away with: `li` and `ol` instead of `*`. Even when using a direct sibling combinator and targeting a specific class, I found `:has()` involving `*` to be _very_ slow. The more specific selectors we can use with it — the better. <br/><br/> We also kept the main downside of the previous method: if the number of children is larger than our limit, the `--sibling-count` and `--children-count` will break for all elements. <!-- span="2" offset="2" -->

{{<Partial src="examples/children-count.html" />}}

Note how this time the code[^webkit-bug] contains everything necessary to both count and index the children, while the method based on the `~` selector is required _in addition_ to the indexing one.

[^safari-bug]: There is also a [Safari bug](https://bugs.webkit.org/show_bug.cgi?id=273125), which I had to work around with the weird `&, &` nesting fix.<br/><br/> There was [another bug](https://bugs.webkit.org/show_bug.cgi?id=261366) with this in Safari, where updating the list dynamically did not result in the proper values applying. Still, at some point something in my interactivity implementation made it go away. <!-- span="2" -->

```CSS
.count-and-index-99-children { &, & {
  --cc2: 0;
  --cc1: 0;
  --children-count: calc(10 * var(--cc2) + var(--cc1));

  & > li {
    --si2: 0;
    --si1: 0;
    --sibling-index: calc(10 * var(--si2) + var(--si1));
    --sibling-count: var(--children-count);
  }
  & > li:nth-child(10n+1)
    { --si1: 1; ol:has(>&:last-child) { --cc1: 1 } }
  & > li:nth-child(10n+2)
    { --si1: 2; ol:has(>&:last-child) { --cc1: 2 } }
  & > li:nth-child(10n+3)
    { --si1: 3; ol:has(>&:last-child) { --cc1: 3 } }
  & > li:nth-child(10n+4)
    { --si1: 4; ol:has(>&:last-child) { --cc1: 4 } }
  & > li:nth-child(10n+5)
    { --si1: 5; ol:has(>&:last-child) { --cc1: 5 } }
  & > li:nth-child(10n+6)
    { --si1: 6; ol:has(>&:last-child) { --cc1: 6 } }
  & > li:nth-child(10n+7)
    { --si1: 7; ol:has(>&:last-child) { --cc1: 7 } }
  & > li:nth-child(10n+8)
    { --si1: 8; ol:has(>&:last-child) { --cc1: 8 } }
  & > li:nth-child(10n+9)
    { --si1: 9; ol:has(>&:last-child) { --cc1: 9 } }
  & > li:nth-child(n+10):nth-child(-n+19)
    { --si2: 1; ol:has(>&:last-child) { --cc2: 1 } }
  & > li:nth-child(n+20):nth-child(-n+29)
    { --si2: 2; ol:has(>&:last-child) { --cc2: 2 } }
  & > li:nth-child(n+30):nth-child(-n+39)
    { --si2: 3; ol:has(>&:last-child) { --cc2: 3 } }
  & > li:nth-child(n+40):nth-child(-n+49)
    { --si2: 4; ol:has(>&:last-child) { --cc2: 4 } }
  & > li:nth-child(n+50):nth-child(-n+59)
    { --si2: 5; ol:has(>&:last-child) { --cc2: 5 } }
  & > li:nth-child(n+60):nth-child(-n+69)
    { --si2: 6; ol:has(>&:last-child) { --cc2: 6 } }
  & > li:nth-child(n+70):nth-child(-n+79)
    { --si2: 7; ol:has(>&:last-child) { --cc2: 7 } }
  & > li:nth-child(n+80):nth-child(-n+89)
    { --si2: 8; ol:has(>&:last-child) { --cc2: 8 } }
  & > li:nth-child(n+90):nth-child(-n+99)
    { --si2: 9; ol:has(>&:last-child) { --cc2: 9 } }
}}
```

The main benefit of this method — the `--children-count` is available not only to the children, but also to the parent, and some use cases can benefit from this. The current specs do not cover this. I opened [a CSSWG issue to add a `children-count()` function](https://github.com/w3c/csswg-drafts/issues/11068) to the other two, as this is also something that would be great to have.

I assigned the `--sibling-count` to be the same as `--children-count` on the items — this way I’ll use `--sibling-coung` whenever possible to show what will be available with the currently specified functions.


### Prototyping Randomness

Now that we have an index assigned to every element, and that we know the total number of elements, we can attempt to implement some [pseudorandom number generator](https://en.wikipedia.org/wiki/Pseudorandom_number_generator) that will use them.

Note that I have no idea what I’m doing now: I just threw things at it, testing if it looked good enough. I am sure there are multitudes of other ways[^cicadas] to prototype this part: from using a pre-defined list of random numbers and accessing them by their index, to doing some more complicated algorithm.

[^cicadas]: Alongside all the other methods of achieving pseudo-randomness: for example, see [“The Cicada Principle, revisited with CSS variables”](https://lea.verou.me/blog/2020/07/the-cicada-principle-revisited-with-css-variables/) by [Lea Verou](https://lea.verou.me/) which builds upon the original [“The Cicada Principle and Why It Matters to Web Designers”](https://www.sitepoint.com/the-cicada-principle-and-why-it-matters-to-web-designers/) article by [Alex Walker](https://github.com/alexmwalker). <!-- span="3" offset="2" -->

What I’m doing is also probably not optimal, and some parts might be simplified or removed without a big impact on the result. Again: I have no idea what I’m doing. But that means you can experiment with it more, and maybe come up with something that will fit your demos better!


#### Basic Algorithm

My initial goal is to get a `--random-value` property on every item which would be pseudo-randomized from `0` to `1`, which allows me to use it further.

The algorithm I will implement will depend on the `--sibling-index` and `--children-count`: I want things to be different based on the number of elements present for a bigger unpredictability. However, for some cases, you could wish to remove the dependency[^stable-later] on the children count, and only use the index. For example, if the elements are added one by one, then the changes of the prior elements won’t be desired.

[^stable-later]: Later in the article, it would be possible to play with this in the interactive examples. <!-- offset="3" -->

Here is the calculation[^calculation] I will be using (the result of which I found random enough for my purposes):

[^calculation]: I still like using my [“Calculation Indentation”](https://blog.kizu.dev/calc-indent/) coding style for things like that. <br/><br/> Note how I am separating some common or overrideable parts into separate custom properties: this allows for better control when needed. [Kevin Powell](https://www.kevinpowell.co/) has a great talk about a similar approach of separating calculations into variables at [CSS Day 2024](https://cssday.nl/2024): [“Start over-engineering your CSS”](https://www.youtube.com/watch?v=k_3pRxdv-cI). <!-- span="2" -->

```CSS
.random-example {
  & li {
    --random-part-from-sibling:
      pow(var(--sibling-index), 3)
      -
      pow(var(--sibling-index), 2)
      +
      var(--sibling-index);
    --random-part-from-count: var(--children-count);
    --random-limit: var(--closest-prime);
    --random-value: calc(
      mod(
        var(--random-part-from-sibling)
        *
        var(--random-part-from-count)
        *
        var(--seed, 0)
        ,
        var(--random-limit)
      )
      /
      var(--random-limit)
    );
  }
}
```

Here it is applied to our 99 items, showing the distribution among them:

{{<Partial src="examples/random-1.html">}}
Here and below, checking <label class="Link Link_pseudo" for="random-1-sort-by-value">Sort by value</label> can demonstrate the random distribution of the values. On the other hand, <label class="Link Link_pseudo" for="random-1-stable-random">Stable random</label> will remove the dependency on the `--children-count`, and will use the maximum available `--random-limit`, making the randomness of the items do not change based on their count.

Hovering over lines in the demo will show the hovered item’s original index and the pseudo-randomized value assigned to it (converted to integer).
{{</Partial>}}

I won’t explain how I developed this particular algorithm — it was mostly trial, error, and _trying_ to read about [linear congruential generators](https://en.wikipedia.org/wiki/Linear_congruential_generator).

Visualizing the randomness in the demo above, alongside the sorting option[^sorting-option], allowed me to get to the algorithm that looked _good enough_. Some other algorithms resulted in pronounced patterns when the distribution was not even or random enough.

[^sorting-option]: See [“Variable Order”](https://kizu.dev/variable-order/) — while this is not a method to use in production due to its accessibility implications, it works very well for demos and testing. <!-- span="2" offset="1" -->

You can see how I am using the [`pow()`](https://drafts.csswg.org/css-values/#exponent-funcs) of `--sibling-index` to get a not-so-linear distribution and add the `--children-count` to the mix, making things depend a bit more on the number of children.

I am also adding a `--seed` variable as a multiplier, which can be used to adjust the randomness.


##### Getting the Closest Prime

But I did not explain the `--closest-prime` I used for the `--random-limit`. It also depends on the `--children-count`, and is calculated in the following way:

```CSS
@property --captured-integer {
  syntax: "<integer>";
  initial-value: 0;
  inherits: false;
}

.random-example {
  & ol {
    --limit: 102;
    --x: var(--children-count);
    --closest-prime: var(--captured-integer);
    --captured-integer: calc(
      var(--limit)
      -
      max(
        min(1, 11 - var(--x)) * (var(--limit) - 11),
        min(1, 13 - var(--x)) * (var(--limit) - 13),
        min(1, 17 - var(--x)) * (var(--limit) - 17),
        min(1, 19 - var(--x)) * (var(--limit) - 19),
        min(1, 23 - var(--x)) * (var(--limit) - 23),
        min(1, 29 - var(--x)) * (var(--limit) - 29),
        min(1, 31 - var(--x)) * (var(--limit) - 31),
        min(1, 37 - var(--x)) * (var(--limit) - 37),
        min(1, 41 - var(--x)) * (var(--limit) - 41),
        min(1, 43 - var(--x)) * (var(--limit) - 43),
        min(1, 47 - var(--x)) * (var(--limit) - 47),
        min(1, 53 - var(--x)) * (var(--limit) - 53),
        min(1, 59 - var(--x)) * (var(--limit) - 59),
        min(1, 61 - var(--x)) * (var(--limit) - 61),
        min(1, 67 - var(--x)) * (var(--limit) - 67),
        min(1, 71 - var(--x)) * (var(--limit) - 71),
        min(1, 73 - var(--x)) * (var(--limit) - 73),
        min(1, 79 - var(--x)) * (var(--limit) - 79),
        min(1, 83 - var(--x)) * (var(--limit) - 83),
        min(1, 89 - var(--x)) * (var(--limit) - 89),
        min(1, 97 - var(--x)) * (var(--limit) - 97),
        min(1, 101 - var(--x)) * (var(--limit) - 101)
      )
    );
  }
}
```

I know, I know, I could probably remove this completely and replace[^using-for-stable] with `101`, but I like the way it changes for different counts of elements. Playing with it allowed me to come up with a rather compact way to find a number closest to some element in a certain range.

[^using-for-stable]: And that’s what I did to implement the “stable” random in all the demos. <!-- offset="1" -->

While the `--limit` could be expanded in this case, as it won’t change, I kept it this way to demonstrate how the algorithm works. The goal of it is to find the closest prime number that is bigger than `--children-count`. I won’t go into details, but to get a more random-looking result, we need to use a prime number in the [`mod()`](https://drafts.csswg.org/css-values/#funcdef-mod) divisor, and I found using the closest one to the number of items works the best.

To select the closest prime to our `--children-count`, for every prime we do the following:

1. Subtract the `--x` from our prime number: if the number is bigger, the result will be negative, and if it is smaller — it will be positive.

2. We use `min(1, …)` to clamp any positive numbers to 1, and we aren’t concerned about the negative ones, as we will later wrap everything with `max()`.

3. We subtract our prime number from the `--limit` that is guaranteed larger than the biggest prime we test. This makes it so the smaller the prime — the larger that particular result is.

4. We multiply it by what we got out of `min(1, …)`, which, for primes _larger_ than our `--x` would be `1`, and some negative number otherwise.

5. We wrap everything in a `max()` — any negative numbers will be thrown out, and the largest number here will be the one for the prime we’re looking for.

6. Final step: subtract this number from our `--limit`, normalizing it — this gives us the prime number we want to get.

7. Just in case, I am using the [captured custom property](https://blog.kizu.dev/captured-custom-properties/) for the `--closest-prime`, so it would be calculated only once on the `ol`, and not on every `li`.

While this algorithm is likely unnecessary, it can be used for any similar purpose — when we’d like to round something to the closest number in some range. I have been thinking about this for a while and opened [a CSSWG issue](https://github.com/w3c/csswg-drafts/issues/11067) with a proposal to add this as an additional ability of a `round()` function.

##### Multiple Random Numbers

Of course, for a single element, we’d get only one random value as `--random-value`. Occasionally, we could want to have _different_ random values with other seeds. For this, it is possible to add a second `--random-value2` and modify the algorithm slightly, like adding an extra multiplier inside, or even reusing the first random value inside as its seed.

For example, we could add a `--random-value2` like this:

```CSS
--random-value2: calc(
  mod(
    var(--random-part-from-sibling)
    *
    var(--random-part-from-count)
    *
    calc(var(--seed, 0) + 21)
    ,
    var(--random-limit)
  )
  /
  var(--random-limit)
);
```

Here, I am adding additional value to the seed. It might be possible to set this up in a more DRY way, but I kept it like this for readability.


#### The prototype of `random()` for the `<calc-sum>` ranges

What we got with the `--random-value` is close to what we could get with `Math.random()` — just a value from zero to one. The native `random()` function, though, will be much more flexible and powerful, similar to how [`round()` in CSS](https://www.w3.org/TR/css-values-4/#round-func) has a much more useful API than the [`Math.round()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round) in JS.

It is rather trivial to get such ranges from our current `--random-value`, though. Let’s say we have two values in our range: `--min` and `--max`. If we want to get a random value in their range, all we will need to do is to multiply their difference by our `--random-value`, and then add the `--min`.

In the first example demonstrating the randomness, our elements span from 0 to 100% of their parent’s width based on their random value. Here is how we can do it if we want to instead span from 20% to 70%:

```CSS
.random-2 {
  & li {
    --min: 20%;
    --max: 70%;
    --random-in-range: calc(
      (var(--max) - var(--min))
      *
      var(--random-value)
      +
      var(--min)
    );
    background-size: var(--random-in-range) 100%;

    --min-hue: 0deg;
    --max-hue: 360deg;
    --random-hue: calc(
      (var(--max-hue) - var(--min-hue))
      *
      var(--random-value)
      +
      var(--min-hue)
    );
    --bg: oklch(0.89 0.2 var(--random-hue));
  }
}
```

Here we did even adjust the hue of the elements to be from 0deg to 360deg!

{{<Partial src="examples/random-2.html">}}
Checking the <label class="Link Link_pseudo" for="random-2-diff-random">Diff random</label> option here will use the `--random-value2` for the hue: when using the <label class="Link Link_pseudo" for="random-2-sort">Sort</label> option, we can see how with the same random value used, the items stop being random when sorted — but when using two different random values they maintain the variance.
{{</Partial>}}

As seen from this example, we can often use the same `--random-value` for different properties and effects. They’ll be connected, but it won’t always matter, and it can be easy to adjust later based on some static constants.

#### The `random-item()` Prototype

The values we want to randomize cannot always be expressed as numbers. For this, the spec proposes a `random-item()` function for randomly choosing one of the values we pass inside.

There is no good way to map a number to an abstract value right now, aside from some hacks. One such hack could be mapping the values via `@keyframes`. In the below example, the items switch randomly between different values of a `--bg` custom property (without registering it!), and a `background-position` value, without any interpolation:

{{<Partial src="examples/random-3.html">}}
Again, playing with a <label class="Link Link_pseudo" for="random-3-diff-random">Diff random</label> option in tandem with <label class="Link Link_pseudo" for="random-3-sort">Sort</label> shows how, with a single random value, things align and correlate with each other.

When we <label class="Link Link_pseudo" for="random-3-diff-random">detach them</label>, their _width_ separates from the _color_ and _alignment_, which are now bundled together. In this case, this is visible even without <label class="Link Link_pseudo" for="random-3-sort">sorting</label>. Potentially, we could introduce a _third_ random value to make all three independent of each other (later use cases will demonstrate this).
{{</Partial>}}

And the hacky CSS[^dashed-idents] for this:

[^dashed-idents]: A very tiny thing to point out here: I am using a [dashed ident](https://www.w3.org/TR/css-values-4/#dashed-idents) for the `@keyframes`, even though it is not necessary for the animations. This is a convention that I follow, about which I previously wrote a blog post: [“Dashed Idents for Everything”](https://blog.kizu.dev/dashed-idents-for-everything/).<br/><br/> Note also the `1` that we have to pass as the last argument of `round()` — I will do this in other examples as well, and it is required for the demos to work in the stable Safari. Otherwise, we could omit the `1` here — a change to the specs [resolved by CSSWG](https://github.com/w3c/csswg-drafts/issues/9668#issuecomment-1969495056) in February 2024. <!-- span="2" -->

```CSS
@keyframes --random-item {
  0% {
    --bg: var(--GREEN);
    background-position: left;
  }
  50% {
    --bg: var(--PINK);
    background-position: center;
  }
  100% {
    --bg: var(--RED);
    background-position: right;
  }
}

.random-3 {
  & li {
    --min: 0;
    --max: 3;
    --random-item: round(
      down,
      (var(--max) - var(--min)) * var(--random-value)
      +
      var(--min),
      1 /* Need for Safari */
    );
    animation:
      --random-item
      calc(1s * (var(--max) - 1))
      calc(-1s * var(--random-item))
      steps(var(--max))
      both;
    animation-play-state: paused;
  }
}
```

Using[^paused-animations] an `animation-play-state: paused`, we can then use some calculations to change the `animation-delay` to choose which keyframe to show — and thus which values to apply.

[^paused-animations]: This method is described in the [“Inline conditionals in CSS, now?”](https://lea.verou.me/blog/2024/css-conditionals-now/) article by [Lea Verou](https://lea.verou.me/), among many other methods of applying conditional CSS. <!-- span="2" -->

This is, of course, far from being a viable solution, but hey, for prototyping it works. And I can’t wait for the native `random-item()` function, as it will simplify cases like these significantly.


## Use Cases

I could think of many use cases, and I saw many of them in the wild, but for this article, I want to iteratively work on just one.

In each section, I am adding a separate use case for these new CSS features, showing how they can work well together.


### Dynamic Hue

First, I want several cards with different backgrounds spanning the full hue. This requires knowing both `sibling-count()` to divide the hue evenly, and `sibling-index()` to assign each card an appropriate value.

{{<Partial src="examples/use-case-cards-1-colors.html" offset="0.5">}}
In this, and most of the following examples, I add interactive options with the newly added features like the <label class="Link Link_pseudo" for="cards-1-colors">Colors</label>, one by one. This allows adjusting them separately and making it easier to compare what changes.
{{</Partial>}}

Here is the code that defines the background color for these cards:

```CSS
.cards-colors li {
  background: oklch(
    0.9
    0.125
    calc(
      27deg
      +
      300deg
      *
      (var(--sibling-index) - 1)
      /
      (var(--sibling-count) - 1)
    )
  );
}
```

Because the `sibling-count()` is 1-based, we need to subtract `1` from it, making the initial hue “stable” (independent of the number of elements). Then, we also add `27deg` to shift this starting point a bit.

To make the hue of the _last_ item “stable”, we subtract `1` from the `--sibling-count` and use only `300deg` instead of `360deg`, otherwise the first and last hues would be too similar.


### Random Transforms

Initially, I wanted to add some variation to the colors as well, but, at least for me, it isn’t easy to _see_ the randomness introduced (unless we completely mix them around).

I found adding some rotation with a slight translation to be the easiest way to separate the cards visually, aside from the hue change:

{{<Partial src="examples/use-case-cards-2-rotation.html">}}
Playing with the <label class="Link Link_pseudo" for="cards-2-stable">Stable random</label> and adjusting the <label class="Link Link_pseudo" for="cards-2-range">number of items</label> shows its impact pretty well.
{{</Partial>}}

With the ability to get some random value, it is easy to assign some semi-random transforms to the cards:

```CSS
.cards-rotation li {
  rotate: calc(
    7deg
    *
    (1 - 2 * var(--random-value))
  );
  translate:
    calc(
      0.25em
      *
      (1 - 2 * var(--random-value2))
    )
    calc(
      0.25em
      *
      (1 - 2 * var(--random-value3))
    )
  ;
}
```

I am using all three different random values for each of the translations and the rotation, and when doing so, I found the best way to apply the random adjustment is by using the `N * (1 - 2 * random())` formula[^distribution-formula]. This way, we define the possible values from `-N` to `N`, which leads to a very convenient way of adjusting anything.

[^distribution-formula]: If I were to make things DRY here, I would separate each `(1 - 2 * …)` part into a variable like `--distribute` and `--distribute2`, which could then be used as multipliers for any values. <!-- offset="3" span="3" -->

As a result, there is some variation in how cards are placed, making them look a bit more organic.


### Square-ish Layout

In a [“Using the Parent”](#using-the-parent) section, I mentioned that there are cases where we’d want to know the number of children _at the parent_. One case where this could be useful is for grid layouts, where we’d like to define the grid on the parent component while knowing the number of children we will have.

For example, what if we want to have a square grid?

{{<Partial src="examples/use-case-cards-3-grid.html">}}
I recommend playing with the <label class="Link Link_pseudo" for="cards-3-range">Number of items</label> in this example specifically to see how the layout adapts.

Note: I did not add an option to control if the layout is square, as it is not as useful, and the following iterations depend heavily on it.
{{</Partial>}}

If we know the number of children, then creating such a grid is as simple as getting the square root of it and using it in the `repeat()` of `grid-template-columns`:

```CSS
.cards-grid ol {
  display: grid;
  --x-count: round(sqrt(var(--children-count)), 1);
  grid-template-columns: repeat(
    var(--x-count),
    min-content
  );
}
```

I am using a `round()` function[^round-issue] around our calculation even though the value from the `sqrt()` will be converted to an integer when passed to `grid-template-column` — this is because I am also saving the value of this to a `--x-count` custom property, as this will make it easier to reuse it later.

[^round-issue]: Note that when we use `round()`, we (for now) have to specify the “`, 1`” — it was decided that this could be omitted, but the current stable version of Safari does not yet support this change. <!-- span="2" -->

### Snake Order

After creating a square layout, we now know how many items there are, both in a row and a column. We could also get this information for non-square layouts if we knew the dimensions of the elements, but it is much simpler to do for the square one.

Knowing these, there are so many things we could do! In the below example, I modify the position of the elements in the grid, making the items in every odd row go in reverse, resulting in a snake-like alternating order.

{{<Partial src="examples/use-case-cards-4-snake.html">}}
Note how the elements go from left to right, then from right to left, repeat. Using <label class="Link Link_pseudo" for="cards-4-range">Number of items</label> input allows visualizing how items are added.
{{</Partial>}}

Now, the math becomes a bit more complicated. First, knowing how many items there are in a row — the `--x-count` from the previous example — we can calculate the position of every item: their `--x-index` and `--y-index`:

```CSS
.cards-example li {
  --x-index: calc(
    mod(var(--sibling-index) - 1, var(--x-count))
    +
    1
  );
  --y-index: calc(
    round(
      down,
      (var(--sibling-index) - 0.999)
      /
      var(--x-count),
      1
    )
    +
    1
  );
}
```

- For `--x-index` we can use `mod()` on the sibling’s index to get the reminder after dividing it by the number of elements in a row.

- Similarly, we can use `round()` to get the row on which the element is on.

- In both cases, we first need to subtract `1` from the index, as it is 1-based, and then add this `1` back for consistency.

- I stumbled upon [a curious bug in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1924363), where subtracting a value inside `round()` sometimes leads to incorrect results. I filled it out (and it is already closed!), and, for now, I found a workaround of using `0.999` in this case.

With these variables, we can now calculate which grid row and column each item should go to:

```CSS
.cards-snake li {
  --diff: calc(
    var(--x-count)
    -
    2 * var(--x-index)
    +
    1
  );
  --is-reversed: mod(1 + var(--y-index), 2);
  grid-column: calc(
    var(--x-index)
    +
    var(--diff) * var(--is-reversed)
  );
  grid-row: var(--y-index);
}
```

- The `--diff` is how much we’d need to add or subtract from the current item’s index to swap its position in the row.

- The `--is-reversed` will equal `1` for odd rows, and `0` for even ones.

- Now, we can calculate the `grid-column`, conditionally adding the `--diff` based on the `--is-reversed`.

- We don’t need to do anything special for the `grid-row` — just assign the `--y-index` right away (but I can imagine how we could do much more complex calculations if we wanted to).


### Stacking

The final step would be to stack the cards a bit tighter: for this, we will need to do a few more calculations, but the result is worth it:

{{<Partial src="examples/use-case-cards-5-stack.html">}}
Not only do we stack elements closer together, but the elements in the center will have a bigger `z-index` than those on the peripheral.

But, take a look at the <label class="Link Link_pseudo" for="cards-5-z-index">Random z-index</label> option as well: this one is fun too!
{{</Partial>}}

The first thing we need to add, which we did not have to use before, is `--y-count`:

```CSS
.cards-stack ol {
  --y-count: round(up, var(--children-count) / var(--x-count), 1);
}
```

It is easy to calculate by dividing and rounding up the number of children by the number of elements in a row that we calculated previously.

Next, we will need four things:

- The `--x-distance` and `--y-distance` represent how far an element is from the center, including the sign.

- The `--x-score` and `--y-score` which is an always positive number that is the reverse of the distance — the closer to the center of the row or column, the higher it is.

```CSS
.cards-stack li {
  --x-distance: calc(
    0.5
    +
    0.5 * var(--x-count)
    -
    var(--x-index)
  );
  --y-distance: calc(
    0.5
    +
    0.5 * var(--y-count)
    -
    var(--y-index)
  );
  --x-score: calc(
    var(--x-count)
    -
    abs(var(--x-distance))
  );
  --y-score: calc(
    var(--y-count)
    -
    abs(var(--y-distance))
  );
}
```

With these variables set up, we can first calculate our `z-index`:

```CSS
.cards-stack li {
  z-index: calc(
    100 * sqrt(var(--x-score))
    +
    100 * sqrt(var(--y-score))
  );
}
```

Note how we can use `sqrt()` here: it allows us to differentiate between “corner” elements and “offset” elements. For better visual “stacking” we need an item with scores `5` and `5` over both axes to be _higher_ than an element with scores `4` and `6`. Square root allows us to achieve this, and we can multiply the result by `100` for the number to make sense for the integer `z-index`.

Now, the `transform` is slightly more complicated:

```CSS
.cards-stack li {
  transform:
    translateY(calc(
      var(--gap)
      *
      var(--y-distance)
      *
      (abs(var(--x-distance)) + 1)
    ))
    translateX(calc(
      var(--gap)
      *
      var(--x-distance)
      *
      (abs(var(--y-distance)) + 1)
      *
      (1 - 2 * var(--is-reversed))
    ))
  ;
}
```

Both `translateY` and `translateX` are similar: we can use our `--gap` variable, and multiply it by the vertical and horizontal distance from the center. There are two things of note here:

- When we use the distance in the cross-axis, we need to use its absolute value (as it does not make sense to use its sign), and also add `1` to it, so that the final calculation won’t result in zero for the central items.

- For `translateX`, we have to reverse where we shift our element by using the `--is-reversed` that we calculated for the “snake” layout.


### Others

Initially, I wanted to present more use cases here, but I already spent too much time on this article, and I’m not that good at coming up with design ideas.

Many use cases are already provided inside the issues mentioned at the beginning of the [“Tree-Counting Functions”](#tree-counting-functions) and [“Random Values”](#random-values) sections, so if you want more, browse them, as well as about half of all CodePen demos.

But let me link to a few places where these new functions could find a good home that I spotted recently:

- Many of [Ana Tudor](https://thebabydino.github.io/)’s [CodePen demos](https://codepen.io/thebabydino/pens/popular) are using either `:nth-child()` or indices and element count set in HTML. She has an astounding number of use cases she collected there over the years.

- [Amit Sheen](https://amitsh.com/) is another person to look for use cases, with many articles (like his [“Pure CSS Circular Text”](https://frontendmasters.com/blog/pure-css-circular-text-without-requiring-a-monospace-font/) one) and [demos](https://codepen.io/amit_sheen/pens/popular) showcasing many places where `sibling-index()`, `sibling-count()` and `children-count()` could be very useful.

- Many radial interfaces, like [Una Kravets](https://una.im/)’s [Radial Menu](https://una.im/radial-menu/) or a radial list on [Ahmad Shadeed](https://ishadeed.com/)’s homepage, will require knowing both the count and index of elements.

But yeah, go to CodePen or any works of people who write about CSS, and you’ll likely find use cases for all of these functions and more.


## Please, Prototype

I hope the examples in this article — and the overcomplicated code behind them — convince you that it is better to have something native rather than convoluted and hacky code.

These final words are for everyone: authors and browser vendors.

**Please, prototype these features!**

In your designs: look for opportunities to adjust things based on the elements' position, their count, or just by chance, and tell browser vendors you need this.

For implementors: while randomness sounds like a much harder task, the tree-counting functions seem rather straightforward. If browsers implemented them today, it could simplify so many things!
