---

categories: en fun

published: true

thanks_to:
    - "[Fev](http://taerin.deviantart.com/) for the illustration"

---

# Nested links

![Cats playing nested links](/pictures/nested-links.jpg){:.b-figure .b-figure_outer width="500" height="375"}


## The problem

HTML specification have a lot of different restrictions. And I have my doubts about the feasibility of many of those. One example which I stumble upon rather often — nested links.

[Spec](http://www.w3.org/TR/html5/text-level-semantics.html#the-a-element) straightly forbids such nesting:

> The **a** element
>
> […]
>
> Content model: transparent, but there must be no [interactive](http://www.w3.org/TR/html5/dom.html#interactive-content-0) content descendant.

And if you’d do this, browser’s parser won’t understand you and, as soon as it’d see the opening tag for the nested link, it would close the first one right there:

{:.language-html}
    <a href="#Foo">
        Foo
        <a href="#Bar">
            Bar
        </a>
        Baz
    </a>

in the eyes of the browser would be something like that —

{:.language-html}
    <a href="#Foo">
        Foo
        </a><a href="#Bar">
            Bar
        </a>
        Baz

And a live example:

[demo:nested-links-broken]

However, there are cases when you’d actually want to nest one link inside another despite the restrictions.

So, once again, while working on one task I stumbled upon such case. I happen to see and use different workarounds for it before, like emulation of the nested links with JS (for example, with banal `onclick`), or positioning one of the links around the shared wrapper (see [such solution](http://jsfiddle.net/csswizardry/rxsna/) by Harry Roberts), but all those workarounds wouldn’t work in all cases, and wouldn’t work perfectly. We’d either lose the nativity of link, trying to emulate everything from scratch, either won’t be able to make a workaround work just like proper nested elements would.

So, after trying and weighting all the known workarounds in my head, I found out that the current task won’t be solved by any of the workarounds other than full JS emulation. But I stopped and decided to experiment a bit more.

And — found a proper solution. HTML-only one, by the way, the one that gives you a way to nest any number of links one into another.


## The solution

[demo:nested-links-simple]

{:.language-html}
    <a href="#a">
        Foo
        <object>
            <a href="#b">
                Bar
            </a>
        </object>
        Baz
    </a>

What we do there is just placing an object between those links. Yep, it works: all parsers of modern browsers suddenly see those links independently, and won’t break your markup anymore. Hooray.

## Why does it work

What are objects, in theory? They are some external entities, with the type set by the `type` attribute and the content or a link to it placed into the `data` attribute. And the content between the opening and closing `object` tags is, in fact, a fallback, and it would be shown only when browser wouldn’t be capable of displaying the object defined in the attributes. Like, for example, if you won’t have an installed plugin.

And if you’d write some gibberish MIME-type into the `type` attribute, browser wouldn’t understand it and would go straight to displaying the fallback. And, in fact, it would do the same even if you’d omit those “required” attributes at all.

This way, after wrapping any HTML with such atributeless `<object>` we would get just a wrapper element for this content. But a wrapper with an unusual trait: any content inside of it would be treated by browser’s parser without looking at the object’s context. So, using this trait we can, finally, nest one link into another, separating them for parser.

I suppose that this behavior was introduced to browsers because those object fallbacks were mostly used for showing links like “You don’t have our marvelous plugin installed, download it now!” (like, for flash objects). And a lot of developers could use such objects as any other content or images — nesting into all the other tags they had in HTML: links, headers, paragraphs, wherever. So, browsers needed this fallback to display properly in those conditions, and they introduced this behavior, so the “web masters” would be safe from breaking their sites when inserting some copy-and-pasted code for such external objects into their pages.

## Browser support

Not all of the browsers had this behavior from the start.

- Internet Explorer started to behave like this only from the 9th version.

- Firefox — from the 4th.

- Opera — at least from 9th (maybe even earlier — I didn’t dig deeper than that).

- Webkits — all that I checked: Safari at least from 5.1, Chrome — from 14, etc.

Obviously, the only browsers we’d need to support with such conditions are old IE, all other browsers already behave properly in all of the widely supported versions.


### IE fallback

I don’t know of any easy solution for this problem in old IE. At the very least you could try to somehow fix it by “removing” the nested links using conditional comments:

{:.language-html}
    <a href="…">
        content of the main link…
        <object>
            <!--[if gte IE 9]><!--><a href="…"><!--<![endif]-->
                content of the nested link…
            <!--[if gte IE 9]><!--></a><!--<![endif]-->
        </object>
    </a>

You’d lose some functionality there, but it could be ok for the most cases. <span class="sidenote" id="try-expressions">If not (* Curious ones could think about if it is possible to make a fallback using expressions)</span>, you could then insert those links later, separately, using the same conditional comments, or use other workarounds for this problem.

## Is it valid?

Nope, not even close. It is not valid, because we don’t have any of the required attributes on an object. We could set some dummy, but [valid mime-type](http://www.w3.org/TR/html5/infrastructure.html#valid-mime-type), like `type="lol/wut"`, and the object itself would then pass the validation, but as soon as we nest the link inside of it, the validator would throw us an error.

Obviously, validator is a tool not showing anything but the formal specifications compliancy. In our case the usage of links inside objects is completely reasonable and won’t break anything for anyone if we’d make things in a proper way.

More than that, I do not see any reasons at all why specs should’t drop those restrictions and allow us to nest the links. No reasons. None. There are a lot of cases where this is a crucial requirement, and right now all we have are workarounds and “hacks” like this one.


## Usage examples

At first I wanted to describe all the possible use cases for the nested links, with live examples and whatnot, but then I remembered that such examples won’t convince anyone who isn’t already convinced: anyone who ever stumbled upon this problem would have everything they need from the the solution above, and others would always be negative about things like that, _because specs_. Also: it is very tiring to mark up all those examples, so I’ll just put them into a list:

- Excerpts from the articles, when the snippet of first few sentences could contain links which you would’t want to strip from the markup.

- Sidenotes, footnotes and nested terms are all too can be inside links, why not.

- Any complex UI with a lot of nested entities, which could happen to be described as links. Those could be tweets in any of the Twitter’s interface, leading to the tweet’s own page, but at the same time containing other links — to users, hashtags and external pages. Those could be mail interfaces, where the snippet of a message in an inbox, that should be a link to a message itself, could contain other links — attachments, link to threads, labels etc.

## * * *

The one thing I’d like to say in the end is that that trick with an object could be applied for any content that you’d like to use somewhere where the specs forbid you to.

As an example, there are a bunch of new tags in the latest specs that you already should know, like `details` and `figure`. Guess what: by specs you can use them only in flow-level contexts: you can’t have pictures with captions illustrating some word inside a paragraph, you can’t have a description or footnotes for some words inside a paragraph or a heading (and what other than `details` tag would fit for this?), you can’t have a lot of cases that someone doing specs couldn’t think of.

The `<object>` trick solves all those problems. The question is only if such usage would be feasible for you. And I’d say that a lot of restrictions on specs are useless and an ability to work around them, with valid arguments, is priceless.
