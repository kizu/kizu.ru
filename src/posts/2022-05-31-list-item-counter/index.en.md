# Obscure CSS: Implicit List-Item Counter

#Practical #CSS_Counters #Typography #CSS

_A few years ago I wanted to share one little-known CSS feature — a built-in `list-item` counter for ordered lists. But then there were a few browser issues preventing us from using it fully. Now, given that most of those bugs are fixed, we can try starting using them for our lists._

## Intro

I don’t want to go into all the details of using CSS for styling lists[^details] but would like to start right from what I would be talking about.

Let’s say we want to change[^styles] the ordered list’s markers to have brackets after the numbers rather than dots:

{{<Sidenotes span="5" offset="-2">}}
  [^details]: If you’d want to read more about lists in CSS, other than reading [the specs](https://www.w3.org/TR/css-lists-3/), I can recommend this in-depth article by [Rachel Andrew](@rachelandrew): [“CSS Lists, Markers, and Counters”](https://www.smashingmagazine.com/2019/07/css-lists-markers-counters/).

  [^styles]: The live examples in this article would have some extra styles with them — these would be just styles for my blog, which conveniently are using what I’m talking in this article about (with some CSS variables thrown in for convenience). <!-- offset="1" -->
{{</Sidenotes>}}

```CSS
ol > li {
  list-style-type: none;
}
ol::before {
  content: counter(list-item) ') ';
}
```

<style>
  figure ol > li {
    --list-item-content: counter(list-item) ') ';
    --list-marker-align: right;
  }
  figure ol {
    --list-item-padding: calc(var(--THEME_INDENT) * 1.5);
  }
</style>

```HTML
<ol>
  <li>First item</li>
  <li>And the second one</li>
</ol>
```

<figure>
  <ol>
    <li>First item</li>
    <li>And the second one</li>
  </ol>
</figure>

You might notice that in the example above there are just two declarations — and no sign of `counter-reset` and `counter-increment`. This is intended and it works!

## What the Specs Say

Let me copy a bit[^spec] from the [CSS Lists and Counters spec](https://www.w3.org/TR/css-lists-3/#list-item-counter).

[^spec]: I always find reading specs one of the best ways to learn CSS — you can often find very interesting things and nuances that are easy to miss otherwise. <!-- span="2" -->

> In addition to any explicitly defined counters that authors write in their styles, list items automatically increment a special `list-item` counter, which is used when generating the default marker string on list items
>
> […]
>
> In all other respects, the `list-item` counter behaves like any other counter and can be used and manipulated by authors to adjust list item styling or for other purposes.

In the specs, some examples take an advantage of such implicit counters — showing how they would work properly with various attributes on the `<ol>` and `<li>` such as `start` and `value`.

## Obscure HTML list attributes: `start`,` value`, and `reversed`

Did you know? Also not a very well-known aspect, this time of HTML[^html] — we have a native way to control the initial number from which the item would start, adjust a particular item’s value, or reverse[^reverse] the count direction. Look at these examples:

{{<Sidenotes span="3">}}

[^html]: See the [HTML spec for the `ol` element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-ol-element).

[^reverse]: You could do homework if you want: try using all three in a single list and come up with an explanation of why does it work like that. Bonus points if you would manage to implement this without the built-in counter. <!-- offset="0.5" -->

{{</Sidenotes>}}

```HTML
<ol start="42">
  <li>A good start</li>
  <li>And a continuation</li>
</ol>
```

<figure>
  <ol start="42">
    <li>A good start</li>
    <li>And a continuation</li>
  </ol>
</figure>


```HTML
<ol>
  <li>First item</li>
  <li value="42">And then an adjusted one</li>
  <li>The following would continue from the previous</li>
</ol>
```

<figure>
  <ol>
    <li>First item</li>
    <li value="42">And then an adjusted one</li>
    <li>The following would continue from the previous</li>
  </ol>
</figure>

```HTML
<ol reversed>
  <li>This item takes the last place</li>
  <li>This item could do better</li>
  <li>The item that wins this unnecessary competition</li>
</ol>
```

<figure>
  <ol reversed>
    <li>This item takes the last place</li>
    <li>This item could do better</li>
    <li>The item that wins this unnecessary competition</li>
  </ol>
</figure>

Neat, right? If we would go and try to implement the same behavior from scratch using completely custom CSS counters, it would be much more complicated than those two declarations at the start of the article, but thankfully, we can utilize built-in implicit counters,
and for a lot of cases we could stop writing custom `counter-reset` and `counter-increment` completely.

But this was not always the way it is now.

## Old Bugs

Here is my original[^not-exactly] experiment where I first tested all of this — https://codepen.io/kizu/pen/QaKjmJ — Firefox did not support this at all, and Chrome/Safari did have bugs. The perfect implementation at that time was in Edge!

[^not-exactly]: Not in the _original_ form — I’ve clarified a few things in it since its creation. In this experiment, I have also looked at the workarounds for various issues at the time. <!-- span="4" -->

Here is a list of the issues I stumbled[^report] over at the time:

[^report]: Honestly, it feels good to report bugs when they get fixed later — especially with Webkit the bug was fixed in less than a month! Whenever you find a bug like this — always try to look through the engines' bug trackers to see if someone has ever reported the issue, and there is a big chance that you could be the one making things better for everyone by doing so. <!-- span="4" -->

- [Mozilla](https://bugzilla.mozilla.org/show_bug.cgi?id=288704) — reported by [David Baron](@davidbaron) in April of 2005, fixed in March of 2019.
- [Webkit](https://bugs.webkit.org/show_bug.cgi?id=181084) — reported by me in December of 2017, fixed in January of 2018 (wow, fast).
- [Chromium](https://bugs.chromium.org/p/chromium/issues/detail?id=796961) — reported by me in December of 2017, fixed in July of 2020.

The most serious issue was, of course, the absence of the implementation in Firefox, but the other issues in Chromium and Webkit could be a bit annoying when you would try to override the display of the counters and then use the HTML attributes to control them.

## Acknowledgements

When first did my experiments with the counters, I didn’t find any mentions of the implicit list-item counters except for the specs[^also]. Since then there were a few mentions of them:

[^also]: As well as some StackOverflow answers and browser engines' bug reports. If you know about other articles about this feature — let me know! <!-- offset="1" span="2" -->

- In a 2019 [“CSS Lists, Markers, And Counters”](https://www.smashingmagazine.com/2019/07/css-lists-markers-counters/) article on Smashing Magazine by [Rachel Andrew](@rachelandrew) — following the fix in Mozilla she uses extensively this implicit counter in the examples.
- In a 2020 [“Custom bullets with CSS `::marker`”](https://web.dev/css-marker-pseudo-element/) article by [Adam Argyle](@argyleink) and [Oriol Brufau](https://github.com/Loirooriol) — mentions using it for overriding the display of ordered lists' `::marker`s.

I would explain the low coverage of this CSS feature first by its absence in Firefox, and then by some of the issues that were present at the time.

## The `::marker`

Why I'm not writing about the `::marker`? There are a few reasons. The main being quite poor [browser support](https://developer.mozilla.org/en-US/docs/Web/CSS/::marker#browser_compatibility) at the current moment (May 2022) — while Firefox implemented it in 2019 and Chrome in 2020, and Safari supports only styling of its `color` and `font`, limiting what we can do with it quite drastically.

However, the things would be the same for the `::marker` — it also has the access to the implicit `list-item` counter, so if you're ok with the way Safari doesn't yet support overriding `content` on it, we can already start using it, but I would say, given we have a way to support all browsers including Safari by using `::before` — we should better do this.

## Accessibility

I’m not an accessibility expert, so I’m not sure if things did improve, but at least in `2019` there was an issue where Safari/VoiceOver could lose the role of the list, here is a good article about it — [“Fixing” Lists](https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html) by [Scott O’Hara](@scottohara). The gist is — even though it is generally not recommended to duplicate the role of the elements that have it intrinsically, we might want to still add a `role="list"` to our lists if we’re heavily styling them (and not to forget to test things, making sure the content is available to everyone).

Hopefully, the support for `::marker` would be one day perfect, so there won’t be a need to override the `list-style`, but even we would need to be careful.

## Final Words

If you’re using custom list styling in your code and you have used custom counters — you might think about retiring them and start using the built-in `list-item`. Even more — if you have some kind of user-generated content, and there is a chance there’d be a list with `start`, `value` or `reversed` — there is a big chance those won’t work with anything except for the `list-item` counter. So I hope this post would be helpful.

And, once again: reading specs is one of the best ways to learn what CSS is capable of, and it is possible to find some real gems there. And if those things are obscure — there is a chance they’re not very well tested and you could find bugs that you could report, in the end helping improve the way we write CSS.
