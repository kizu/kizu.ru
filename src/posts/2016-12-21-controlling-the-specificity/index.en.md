# Controlling the Specificity

#CSS_Specificity #Future_CSS #CSS #Preprocessing

_Specificity is one of the most unique and complex aspects of CSS. And right now, the only way to control it are to add stuff to it. But what if we could have a way to reduce the specificity? I’ll look into the coming-up features of `: not ()` and how they could help us to achieve this._

In [the previous article about conditions for CSS variables]({{% LinkTo conditions-for-css-variables %}}) I talked about things that could be used rather soon, even if the support for them is not there yet. In this article I'll go even further — I'll be talking about one thing from the [CSS Selectors Level 4](https://drafts.csswg.org/selectors-4/), which is even less adopted.

The part of this spec I'll be looking at today is the new, enhanced `:not()`. Important disclaimer: the feature I would talk about have almost to no support at the moment (only latest Safari?), and even if it did, I wouldn't recommend to use it as something other than experiment. You'll see why. And after discussing what becomes possible with this new `:not()` I'll describe one more usable similar thing and then propose a few things that I think should be there in CSS instead.

## The All-New Negation Pseudoclass

In Selectors Level 3 `:not()` could have only a single simple selector inside of it. The leveled-up version allows for so much more!

The [specification for the `:not()`](https://drafts.csswg.org/selectors-4/#negation) doesn't say much about its new features. Almost all it says is that instead of a simple selector you can put a **selector list** inside. But that alone means a lot.

### Selector Lists

So, now we can use comma-separated selector lists inside any `:not()`. The commas in usual comma-separated selector lists are an equivalent of logical **or**, but when used inside the `:not()` they actually become **and**.

Look at this example — such selector would target all buttons that are not hovered and not focused *at the same time*:

``` CSS
button:not(:hover, :focus)
```

And it is basically an equivalent of

``` CSS
button:not(:hover):not(:focus)
```

The difference there is how the specificity works for selector lists inside `:not()`, here is [what Spec says](https://drafts.csswg.org/selectors-4/#specificity-rules):

> The specificity of a `:not()` pseudo-class is replaced by the specificity of the most specific complex selector in its selector list argument.

That means that the specificity of `:not(:hover, :focus)` is the same as the specificity of a single class, so it is really different than if you'd just use multiple `:not()`s. You can fit any number of selectors inside a selector list inside `:not()`, and you still would get the specificity of only the highest one. And if the specificity would be the same for each selector in a list, you'll get only this specificity.

This is a first crucial feature for our case.

### Complex Selectors

The second crucial feature is that those selector lists can now contain complex selectors. Before, you could put only a simple selector inside `:not()`, but now there won't be such limit, so you could do stuff like `:not(a.foo:nth-child(2n+1):hover)` and it would just work.

Another interesting thing in `:not()` now accepting complex selectors, is that it can also accept selectors with combinators like `:not(.foo + .bar)`.

### Negation of Negation

Of course, since the `:not()` selector is itself a complex one, you can now use it inside other `:not()`s.

And, yeah, we're at the point where the magic would happen. What does double negation mean in logic? It returns the value to its original binary state.

If we'd have something like that:

``` CSS
:not(:not(:hover))
```

That would work just the same as a `:hover` pseudoclass. That's rather simple. But what would happen if we'd have a selector list there?

``` CSS
:not(:not(:hover), :not(:focus))
```

As the selector lists inside `:not()` work as a logical **and**, and given that each of the selectors would be returned to its original meaning, the result would be almost the same as `:hover:focus`. The difference would be that the specificity of the double negated selector wouldn't be the same as of the usual complex one. Each of the nested `:not()` would have a specificity of a single pseudoclass, and due to how selector lists work inside `:not()`, the specificity of the whole construction would be equal, again, to a specificity of a single pseudoclass.

## Reducing the Specificity

I think you can already guess what all of this means. That's right — using the new `:not()` we can now write selectors with a specificity of a single class. And, actually, we can write _almost any selector_ this way.

So, if we'd like to have a multiclass selector with some states, like `.foo.bar.baz:link:hover` and for it to have a specificity of a single class, so it could be easier overridden later on, we could rewrite this selector this way:

``` CSS
:not(:not(.foo), :not(.bar), :not(.baz), :not(:link), :not(:hover))
```

### What About Combinators?

But what if we'd like to have more complex selectors with combinators, like this one?

``` CSS
.foo:hover > .bar .baz
```

They're possible too, but with a slightly more complex code. What would help us is a universal selector. Here is how the selector above could look like if we'd want it to have a specificity of a single class:

``` CSS
:not(:not(:not(:not(:not(:not(.foo), :not(:hover)) > *), :not(.bar)) *), :not(.baz))
```

That looks awful, right? But that works[^works]!

[^works]: Here is a [test at CodePen](http://codepen.io/kizu/pen/PbgYNV) with this selector, if you'd open it in the latest Safari, you'll see it in action. <!-- span="3" -->

Of course, it would become a bit readable if we'd use some indentations and stuff:

``` CSS
:not(
    :not(
        :not(
            :not(
                :not(
                    :not(.foo),
                    :not(:hover)
                ) > *
            ),
            :not(.bar)
        ) *
    ),
    :not(.baz)
)
```

Still ugly, but manageable (and now, if you'd imagine all of the `:not()` and universal selectors would disappear, you could read it almost as our original selector).

But why it works? Due to how the selector matching mechanism works, the selectors with combinators would match from right to left, so the rightmost selector would be always the one that matches the element we're testing the `:not()` on, so we could safely use just a universal selector instead of it if we need to just check the parents. And the universal selector brings no specificity with it.

The algorithm beyond rewriting the selector this way is rather simple: we go from right to left, replacing recursively all the parts with the double negations, so for when we have nested combinators, we would have more nested `:not()`s. And this way we would always be guaranteed to have the same specificity on each step.

## Complete Control

It worth mentioning that we can already increase the specificity of any given class just by multiplying[^foofoofoo] it, so `.foo.foo.foo` matches just the same as `.foo`, but with a specificity of three classes. And as we can now both reduce and increase the specificity of almost any given selectors, that means we can, finally, **control** the specificity of our selectors, regardless of their complexity. Of course, with the exception that we can't reduce the specificity to be less than the one of the biggest single selector's one, so we can't make a selector that contains a class to be as specific as an element selector or a universal one.

[^foofoofoo]: You can read about this method in Harry Roberts' [article on specificity hacks](http://csswizardry.com/2014/07/hacks-for-dealing-with-specificity/#safely-increasing-specificity) (and, as Harry, I first saw this method in [Mathias Bynens' talk](https://speakerdeck.com/mathiasbynens/3-dot-14-things-i-didnt-know-about-css-at-css-day-2014)). <!-- offset="1" -->

## Preprocessors?

Yes, it is possible to programmatically convert almost any selector to the same selector with any custom specificity from one class to any given number. But I intentionally won't implement it now. As I mentioned at the start — the browser support for the new `:not()` is not yet there, and even if it would be there, the generated code we'd get for such selectors would be awful. If you'd like a small challenge, you can go and implement it just for fun using any preprocessor or postprocessor you like, but I don't recommend on using it anywhere close to production.

## Possible Usage

One of the easiest targets for controlling the specificity are any resets or normalizing styles — right now they often contain things like attribute selectors and pseudoclasses like `:nth-child`, and given that those selectors would also have the element selectors, they would always be higher than a single class in specificity, which would make it harder to override it in the code for your blocks.

For example, you can look at [one part](https://github.com/necolas/normalize.css/blob/1da0911/normalize.css#L125) of Nicolas Gallagher's normalize.css:

``` CSS
/**
 * 1. Remove the bottom border in Firefox 39-.
 * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.
 */
abbr[title] {
    border-bottom: none; /* 1 */
    text-decoration: underline; /* 2 */
    text-decoration: underline dotted; /* 2 */
}
```

Here if you'd like to have a component that uses `<abbr>` and you'd want a border or text-decoration other than underlined, you couldn't use a single class for this component in your CSS alongside using normalize.css — you'd need to override the specificity of two classes instead.

But if we could reduce the specificity of each selector in our resets and normalizes to the smallest — of a single element or a single class — those tools would become even more powerful and flexible.

Another area where the control over specificity is a must have are any complex CSS methodologies. The easiest example would be Harry Roberts' [itCSS](http://itcss.io) which[^itcss] have layers of selectors united by similar area of responsibility. If we could split those layers so they wouldn't merge in their specificity, we would obtain the ultimate power over CSS (ok, I exaggerated it a bit there).

[^itcss]: There is not much written on it anywhere, if you'd like to read more on it, you can try [this article](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/) by Lubos Kmetko. <!-- offset="2" -->

Our general styles for typography would be always higher in specificity than the resets; our generic objects would always override the typography styles of any complexity; our components would always be guaranteed to override the styles of generic objects; and any utilities would always override anything else, and all without using `!important`. And we could even handle things inside each layer by creating sub-layers, to allow modifiers for components to override their base styles even if those base styles are somewhat complex.

### Try It Today

Talking about all of this — we can already kinda implement our styles this way using nothing but the increasing of specificity available already.

The algorithm would be simple: for each layer we need to calculate the maximum specificity, then add a number of redundant matching class selectors to each selector in a way they would split all the things into groups.

Let's say we have an abstract object's selector: `.button:hover`, then a component `.MyBlock-Submit`, and, finally, a utility `.is-hidden`. We can leave alone the first layer for the object, it would be the most bottom one. Then we calculate that it have two class-level selectors, so we add that number (plus one, to guarantee the override of any possible generic selector there) to each selector of the second layer of components. Then we calculate the specificity of the component layer (here we have just one class initially, in reality, it would be often much larger, plus the three classes from the previous layer, plus one for reliability) and add the corresponding number of redundant class selectors to anything in utility group.

The easiest (and the one method with the most support) way to add the desired specificity is possible if you have control over the HTML of a page: just add a class containing a single underscore to `html` element — `<html class="_">`, and then use the chains of `._._` before your selectors. It would look like this:

``` CSS
.button:hover {}
._._._ .MyBlock-Submit {}
._._._._._ .is-hidden {}
```

The only issue that can happen is that one of the selectors you're prefixing would have a part that targets a root selector. In case of `:root` or `html` ones we could rather easily properly attach this part to the actual selector, for more ambiguous selectors we'd need to duplicate it like `._._._._.is-hidden, ._._._._ .is-hidden`, though, if you know that you're doing, you probably wouldn't want to use any other classes on root.

And here we have all of the layers separated in a way their order doesn't matter at all and you could make any layer as complex as you like without the fear of the need to override it later. And yes, you'd still have all the usual CSS specificity rules inside of layers if you'd want to use them for more granular control of things.


## Proposal For Native Tools

In this article, I have shown that it would be already possible to set the specificity of any selector to any given number from one class to eternity. This could be used for more fine-grained control over your libraries' code and components, and in my practice, I had numerous occasions where it would be tremendously helpful.

That's why I propose to add the necessary tools to native CSS — to allow developers to control the specificity. Otherwise, it is possible developers in need would rely on hacks and awful code in the future.

What exactly I propose? Certainly **not** something like a pseudoclass for modifying the specificity of a given selector. That would have too complex syntax (how would you pass the specificity to it?) and you'll need to use this just anywhere when solving your usual CSS problems. That's bad.

What I'd like to see is some kind of a more general way of controlling the specificity not for specific selectors or rules, but for groups of rules. I think of some kind of an @-rule for it, so you could group any number of rules in a “layer[^at-layer]”, then somehow determine the relationships of those layers between themselves, and voilà — you'd have a way to control the _cascade_ itself, the thing that always was out of touch when you were developing your stylesheets.

[^at-layer]: **Edit from May 2021:** there is now [a proposal for a `@layer`](https://www.w3.org/TR/css-cascade-5/#at-layer) in the 5th level of the CSS Cascade and Inheritance module thanks to [Miriam](@TerribleMia)! <!-- offset="3" -->

And the best part — specificity is a part of CSS that is applied only for selectors, it doesn't depend on DOM, on any inheritance there etc. So there shouldn't be a lot of troubles implementing something that changes the specificity itself (or creates groups of it like it is already there with the different parts of the cascade).

## Conclusion

CSS is fun, and as this article shows, would be really powerful with the tools new Specs would provide. There would be incredible things possible through hacks. There are already hacks like `.foo.foo.foo` for modifying the specificity, and those tools can allow us to write and reuse the code that is more effective and maintainable than ever.

But I'd like to see those things possible not through hacks, but using the native CSS. I think this is entirely possible to implement in browsers.
