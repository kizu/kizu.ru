# My Site, Version 14.0

#Blog #Meta #CSS #Design

_A New version, new tools, new techniques, new everything — I had a lot of fun in rewriting and re-coding my site, and I think there could be some interesting stuff inside. In this post, you’ll find some words about it alongside a not-so-precise changelog._

More than two years passed since [my previous update of this site]({{% LinkTo the-new-version-of-this-site %}}). After a lot of work, I can finally present you with the newest version of it.

I want to tell you about so many things[^projection]… But a lot of them would need much more words than I’m able to write after all the actual work, so, for now, I’ll present you a list of everything I can remember that changed in a rather compact way.

[^projection]: Actually, I have decided to publish the site update not only with this article but also with one new technical article covering one trick that I came up when developing my site — the [Grid Projection Naming]({{% LinkTo grid-projection-naming %}}). <!-- span="3" -->

## All the Changes

### Engine

The previous version was built with Gulp 3 and a bunch of JS (basically, it was my own static generator). After reading a lot about Hugo[^SaraAndHugo], I have decided to try it as well, especially after I found out it has a lot of the same conventions I had made for myself (like, for multilanguage support).

[^SaraAndHugo]: For example, you can read about [how Sara Soueidan moved from Jekyll to Hugo](https://www.sarasoueidan.com/blog/jekyll-ghpages-to-hugo-netlify/). <!-- offset="1" -->

However, it didn’t have _everything_ I wanted, so my actual build has two steps: I use Gulp 4 to comb through my content files, styles, and some other things, and then output it into Hugo, who then builds everything very very fast. Overall, I sped up the build by around 8 times, and the incremental rebuilds are now much more stable and fast as well.

Basically, now the engine consists of:

1. [Gulp v4](https://github.com/gulpjs/gulp/tree/4.0) with some plugins.
2. [Hugo](https://gohugo.io), which is started from within Gulp.
3. [CSSTree](https://github.com/csstree/csstree/) with some js to build all the styles (and [CSSO](https://github.com/css/csso) to compress them), with source maps, which you can see in your inspector, btw.
4. All the code is still highlighted with [Prism](https://prismjs.com).

And, that is, basically, it? The overall engine is very custom and the code is far from being clean, but I like how everything works.

Ah, and everything is powered by [Netlify](https://www.netlify.com) instead of GitHub Pages, and I didn’t yet encounter a system easier to set up. Netlify is really great!

### URLs

When I first created my site, I wrote there only in Russian. Then, after some time, I started to write all the new articles in both Russian and English at the same time, and later stopped to translate my articles from English to Russian, and English became basically the main language for my site. However, Russian was still the default language in the engine, and everything for the English version was placed in the `/en/` top-level directory.

With the new version I did two things:

1. I have swapped languages: now `kizu.ru/` is in English, and `kizu.ru/ru/` is the part of the site in Russian.
2. I went further and removed all the extra unneeded stuff from the URLs, so each article’s URL is just its “slug”, for example, the URL for this post is just `kizu.ru/v-14-0/`.

All of that was made in a backward-compatible way, with redirects for all the old paths[^redirects]. Hugo, as my previous custom static generator, have a [static aliases](https://gohugo.io/content-management/urls/) feature, which is pretty good. So no links to my articles should become unavailable. But if you’ll manage to find some older link that won’t — feel free to tell me!

[^redirects]: Moving the articles to the root made making the redirects much easier, as I didn’t need to care about previously `ru` pages becoming `en` (except for the `kizu.ru` homepage). <!-- offset="1" span="2" -->

Ah, and, as I now use Netlify, I’ve switched to https and now the domain is prefixed by `www`. My current DNS provider does not support ALIAS, so I’ll live for a bit with those `www`, but would think about moving my DNS to Netlify as well maybe. We’ll see.

### Design & Typography

The foundation of the design is still the same, but there are a lot of changes, some bigger, some smaller. I could miss some of them, but basically:

- There is a new home page, with a list of the recent articles.
- I have added tags to all the posts, added summaries/intros to some of the recent articles, so now everything should be a bit better structured.
- I made the header and footer of each page to feel lighter.
- I have added an article’s date to the top of the page (so it is now both at the start and at the end).
- The links are underlined by default. They now have a custom underline, and still have custom ink skips (not perfect, but oh well).
- Inline code is [still in italic]({{% LinkTo styling-inline-code %}}), but I’ve added a bit of color to them: `like this`, so they’re now different from regular emphasis, but won’t still be a sore and take all the attention.
- I removed `text-align: justify`, which I still like, but want to try everything without it.
- I removed my custom hyphenation solution, and now use `hyphens` in CSS.
- For now, in some places the typography could be a bit worse — I removed the auto-typography stuff that placed the non-breakable spaces everywhere. I didn’t yet find a solution that would integrate into my workflow in the best way but would see if I could do something about it in the future.

And there are a lot of smaller changes. A lot of those can be unintended, as I rewrote the CSS for everything from scratch.

### New Extremely Experimental CSS

Oh, there are so many things! I really hope I could write about them in separate articles. For now, there would be a rather brief description, but if you’ll want to know about any of the mentioned parts (or about something you could see in the source), feel free to ask! This would make it easier for me to prioritize which articles to write first.

**One important disclaimer**: a lot of the ways I wrote[^native] my CSS are not really intended for real production sites. I treat my site as a playground and a scientist’s lab so you can find prototypes of all the different weird things there. And if I have used something for my site, it does not mean you should use it for yours. If something interests you, wait for an article about it or ask me directly.

[^native]: All the CSS is written natively, without any pre- or postprocessing other than unwrapping includes and minifying everything afterward. I’ve tried to see what is possible with the modern CSS and how far could you go with it natively. <!-- span="2" -->

So. What is inside?

- CSS Grids. Basically, the main layout is done with them, with a couple of sublayouts. I now have so many things related to CSS Grids I want to talk about! And from the start — the absence of subgrids is very, very painful. So painful, I had to implement one of the things they would allow by using… CSS counters. I won’t say much at the moment, but feel free to look at the source and read the [Counters and Stones]({{% LinkTo counters-and-stones %}}) article.

- CSS Variables. A lot of them. I mean, **a lot of them!** A lot of the following list items were probably implemented using them.

- A single `@supports` rule which applies all the site’s styles only for those who support CSS variables. As those also support Grids, this allows me to not think much about some minor aspects of support. Browsers without variables would get some very very basic styles for the layout, and that’s it. The content would be accessible, but yeah. My whole site is very experimental, there is no other way I’d do it I think.

- An implementation of my [Label to Input]({{% LinkTo label-to-input %}}) article, for passing hover state from sidenotes to their context and back. In the previous version of my site it was implemented differently, but for my current layout the previous method wouldn’t work, so I had to do something else for this. I would probably write a separate article about the sidenotes, where I would cover this in more details.

- No combinators other than “adjacent sibling combinators”. Yes, no “descendant” or “child” ones. And no, while I have used BEM-style components for some of the things, most of the HTML elements do not have any classes and are still contextually modified. How? By using variables. By using variables probably _too much_.

    This is the most experimental and not really practical thing there, made more like a “challenge” for myself than something that should be promoted. By doing this I found a lot of aspects of CSS variables I wouldn’t find otherwise, and maybe some of the methods I’ve implemented could be adapted to something more practical. But don’t throw away your combinators just looking at my CSS — they’re still good, and they’re still a crucial part of CSS.

    Note that there are still those combinators in the styles for the Prism theme, but I have plans to write a CSS variables-based theme for it, so maybe one day I’ll remove those too.

- One single media query with the only things changed being five variables on the `:root()`. A lot of the layout changes are handled by CSS Grid layout, and I need only one MQ stop for smaller screens, with everything else handled by CSS Variables. Actually, look at the next item.

- [Conditions for CSS variables]({{% LinkTo conditions-for-css-variables %}}). Slightly similar to those I described in my article but evolved in some ways to become more simple to use. This is one of the things I would totally write in the future, so stay tuned!

- Some aspects of atomic CSS principles. But by using CSS variables. This works kinda nice, especially alongside BEM stuff that I still use in some places.

- - -

I think that I totally forgot about something, and there can be much more I would want to write about my new site, but I would better do this in separate articles[^projection-again], otherwise, I would never finish this post.

[^projection-again]: And there is already one new article like this — [Grid Projection Naming]({{% LinkTo grid-projection-naming %}}), read it next, if you didn’t yet!

Feel free to explore the source of my site, or just play with it and wonder how things are done. Just be cautious: I didn’t try to write it in an understandable or maintainable way. Everything is a prototype, an experiment, a bunch of sticks and rocks glued together. There are interesting bits but do not expect a masterful work of art.

I would like to know what do you think of my site, what seemed to be bad or good, what can be improved and so on. I’m open for emails at [kizmarh@ya.ru](mailto:kizmarh@ya.ru), and you can always write to me [on mastodon](https://kizu.dev/@kizu). I hope you’ll find something interesting for you here!
