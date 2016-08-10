# The New Version of This Site

Around one and a half month ago, on [June, 23rd](*yep "Yep, it was more than a month from the publishing of a site till I published this post — I wanted to see how the new site would work in production and fix some things here and there."), I published a new version of my site. Once again. It is rather hard to remember which version number it should be now. If we'd count it from the very start, from the times when I didn't know how to markup pages properly, this would be the thirteenth version. Or something around that. Of course, that is if we won't count all the unfinished and trashed versions.


## A Bit of History

My very first site was uploaded to the internets on the fourth of November 2001. I didn't know what CSS is. At all — the site was made mostly of frames and tables. That site's content was mostly a bunch of my childish creations. Like custom maps for the Heroes of Might and Magic III game, some stupid poetry, some other utter nonsense. The site moved from one of numerous free Russian hostings to another, ending at the “narod.ru” where it stayed for quite a long time — 8 different versions — without any resemblance to what you can see on this site today.

In December 2006, I happened to read all the CSS specifications for the first time, and, a bit more than a year after that, in February 2008, I've launched a ninth version of my site, this time on my own domain — kizu.ru. At this time I already knew something about how to build web pages, all due to the years of tweaking the styles for LiveJournal, starting from the CSS overrides, and finishing with custom templates on LJ's own templating engine. Therefore, I decided to dedicate my new site to web development, and all my creative stuff could be now found only in my archives and friends-only LiveJournal entries.

At first, I used Movable Type as an engine for kizu.ru. Then, in August 2009, when I went deeper and deeper into front-end web development and learned how to make all the things from scratch, I rewrote the site to be just a set of static HTML files. This went until February 2011, when I've finally fed up with updating the site manually (using regular expressions and global search-and-replace in my code editor), so I managed to work out some automatization and remade everything I had using nanoc static site generator.

Another two years passed and on January 17, 2013, I relaunched the whole site once again, this time using Jekyll, with the hosting on GitHub Pages. This time though, I rethought the whole site's design and went deeper into achieving readable typography for the content. That was the previous, twelfth version of my site.

## Thirteenth Version

### Engine

This time, I managed to rewrite everything from scratch. Twice! Jekyll that I endorsed a lot before, started to become too tight for me. When coming from the box (i.e. the version that is there at GitHub Pages) it can't do too much. Any advanced needs (like some of the typography quirks) could be achieved only by a really hellish code on its Liquid template engine, or by using external ruby plug-ins. I went far beyond what was possible in Liquid (and made some things there I doubt anyone had gone that far to) and was at its limits, and you couldn't run the ruby plugins on GitHub Pages. And if I'd need to build the site as an extra step and push the built static files, I thought of using something that I'm more familiar with — JS.

So I chose Docpad. I almost rewrote the whole site using it, but the farther I went, the longer the build time increased. At one point, when the build time went beyond 90 seconds, I told myself to stop and look at the site with fresh eyes. After some thoughts, after reading both Docpad docs and the docs of different other static site generators, I concluded that nothing that is there on the market would fit my needs. Everywhere I needed more than the projects could allow me to, so, in any case, I'd need to write more than 90% of what I need by myself, without using any external plugins. And that meant fighting with how the static generators were meant to work.

In the end, I wrote the whole static site generation thing by myself, using gulp as a foundation and reusing some of the custom JS I wrote for the Docpad version. Disclaimer: [don't look into the source](*don-t "BTW, I made a [short talk](https://vimeo.com/album/2588576/video/77929464) with this exact name."). Everything. Is. Very. Bad. I have learned gulp on the fly, prototyped, experimented. But even this non-optimized and not profiled code runs 10 times faster than what I have managed to get from Docpad — around 8-9 seconds top, with more features and complexity. With watchers, different parts could be rebuilt even faster, and I have plans to add partial rebuilds just for specific posts that would make everything lightning-fast. And it is already much easier to add new features even with the current messy code base.

Anyway, I'm glad that I went out of using the existing static generators and learned the basics of gulp; maybe one day I'll separate some parts of my engine so you could reuse it too. But I can't promise anything there. Maybe at one point I'll even rewrite everything on something new, like all that fancy react-webpack stuff, who knows! But right now almost everything is fine for me.

### Markup, Design, and Typography

You shouldn't look into the sources of CSS too. Most of the styles are there from the previous version of the site, and while some things are rewritten a bit, I'd like to rewrite everything from scratch there again. No, I still like a lot of what I wrote, but the source is dirty, badly structured, don't look at it. The tastiest stuff would be explained in the [future posts](*i-swear "Yeah, I often overpromise all the new posts, but _for once_, I'm going to fulfill it, I swear! :)") anyway.

The design may seem to be the same as it was before at the first glance. But a lot of little details had changed, especially in typography. I'm still using a custom font that I bought — 21 Cent by Letterhead, but this time, I bought another face for the headers. I've started to use [more OpenType features](*overused "Maybe even I've overused them somewhere just for the sake of demoing them."), added hyphenation, and — oh wow! — justified text. And it even looks not that awful — thanks to the hyphenation and enough of available space for the text. Overall, I use a lot of experimental and not optimal stuff there. I'm sure I would change some of those things in the future, and I certanly would drop other things if they would't work out.

### Content

I have a lot of plans and ideas about what should be there on this site. Right now there are all the same articles that were there before, but I'm removing the unnecessary splitting to all the different categories (they would be there, but just as one of many other filters), and created a [list of everything that I have there](/en/everything/) instead, so it would be easier to find an article or an experiment you need. I'm planning to fill it up over time not only with new posts and experiments, but also with different old content that I hadn't yet published or translated from Russian for some reasons.

Other than regularily writing new content (hopefully), I would update the basic structure of the site too. There'll be a regular “about me” section one day, aside from a proper CV, and alongside other interesting new pages. Here is an example of what would be there: [the list of all talks I ever gave](/en/talks/) (almost all of those are in Russian, but there are two small ones in English you could enjoy).

## Welcome!

Thank you if you managed to read this post till this point. At first, I planned to make just a short post telling you “Hey! Here is a new version!”, but I went rather deep into the site's history and [versioning](*old-versions "Maybe one day I'll write more about all the different old versions. When I'll be ready."), then submerged into the whole double jekyll→docpad→gulp rewrite. In the end, it became a not-so-short post, so sorry for that :)

As always, if you'll find any typos or mistakes in the texts, or bugs in markup — feel free to write me [an e-mail](mailto:kizmarh@ya.ru), fill up an [issue at GitHub](gh:kizu/kizu.github.com/issues), or let me know at [twitter](@kizmarh) anytime. I'll be glad! If you'd review the design and typography in details and would have any questions — they're welcome too, of course! While I have plans for future posts, if you would be interested in something specific, I will be happy to elaborate on it, as this would be a nice motivator for me to continue writing.

