# Restarting kizu.ru

#Blog #Meta #Jekyll

Hi there! That was a long way and I think I’m somewhere near the end — I’m relaunching my site. I can’t remember how many versions of it were there when it was entirely in Russian, but that would be the second version of my site in English.

Oh, did I say I’m near the end? I lied. You know what is the main feature of this version? It’s rough. It’s terribly, awfully draft, it's broken and smelling. Don’t look at the source — you won’t find there anything better than ugly, barely working code. Really, I’m not joking. Why is it so? I decided to fight my perfectionism. I tended to polish, refine and then polish again my site before; I tried to show only the bestestest code I wrote. But now, this version — it is so far from anything I would like before. And that’s awesome.

## The Goal

So, why did I rewrote the whole site from scratch? Why do I think that it’s superior to the previous variants even in it’s deeply rough form?

That’s easy. I set the goal for myself: make a site that **would be easy to update**. That’s it — all other versions with all engines I tried for them weren’t handy for me. I had a lot of things to do for updating and filling the site or changing any parts of it. And I wanted to just write, write a lot. I have a lot of ideas for posts and things to publish at my site, but I’m lazy. Any previous version was like a wall for me, the wall I couldn’t make myself to jump over.

However, after a lot of prototypes, different engines and rewriting the whole thing several times, I came up with the solution that would fit me and would make updating my site a pleasure. And here it is. All the basic features that I wanted are complete, so I can't wait anymore and launch it. But why is it pleasure to update the site now?

## GitHub & Jekyll

I could praise and praise GitHub — all the work those people do is worth a bunch of articles. But I’ll mention just one thing now.

GitHub gives you a way to host static sites — [GitHub Pages](https://pages.github.com). You could take your repo, throw some static files in it and after a few simple actions you could look at your own static site either at GitHub, or at your own domain if you’d set it up.

But there is more: other than just hosting plain dull static files, GitHub allows you to autogenerate them for you — using [Jekyll](https://github.com/mojombo/jekyll#readme).

You could easily make a basic blog using Jekyll — it has everything you’d need for it: categories, tags, permalinks, generating feeds, etc. And as it’s a _generator_, every page is generated just once, on your push to the repo, so it makes it nice for performance and server load — users would get just plain htmls. A lot of people chosen the GitHub as a hosting for their blogs.

I’ve chosen too. I’ve always had a lot of demands for a static generators — I write in two languages, have a lot of experiments embedded in posts and a lot of other stuff. Jekyll uses [Liquid](https://liquidmarkup.org) templating engine. It’s rather simple, but with some guts you could do complex things with it. I’ve dig it a bit and made a lot of small improvements for my blog — there would be at least several articles on that. And maybe someday I’ll refine and rewrite all those things to a state of a standalone project that could be used as a boilerplate for a simple nice and powerful blog with all interesting features included. So, wait for updates — there would be some.

## Prose.io

Ok, so I’m using GitHub, so I can just push the changes to it and they’ll go live. But GitHub have a nice API — so there are some web apps that already use it and do a great job with it. One of them is [prose.io](https://prose.io) — and it works really well, I think I’ll write an article or two on it someday. I really liked it.

## “Write an article”

How much times did I say “I’ll write an article on that” already? The point is I came with that New Year’s Resolution: to write at least one article a week after launching the new site. But everything tells me there would be more articles: I have a lot of drafts and ideas to tell and write on.

So, just wait for it! I’ll try to mix articles on the making of the new version of site with those I have already ideas for or with just anything that would fly there in a front of my eyes.

I’m not sure about the format of the blog/site, because everything could easily change, but I’m sure it would be fun.

## Markup & Design

As I already mentioned — right now there is only basement for the site that gives me an easy way to write a new article, change any previous one or just play with anything. Everything else is unfinished.

Markup is in a state of an early prototype, there is almost nothing interesting here. Well, some nice touches are there hopefully, but they are covered with layers of trash. Bad selectors, no continuous code style (the styles are generated from Stylus actually), a lot of copy-and-pasting, extra code and other bad things. Don’t read my CSS. All the things that _are_ nice I’ll mention in all the new shiny posts, so you could just subscribe to the RSS or [follow updates in my mastodon](https://kizu.dev/@kizu).

Design, on the other hand, is almost stable. Yeah, there would be changes and a lot of them, but the whole concept is there.

1. The Font. I spend a lot of attention to it. There is a lot of the Font: I’ve chosen a big one for body, big enough for me at least. If it seems too big for you — you could reduce it using your browser or just sit farther from the display. I think it’s better to please those who are not that good at looking at small letters than those with eagle eyes.

    Also, the font is serif. The sad part is that my blog is both on English and on Russian — and there are very few good free fonts with cyrillic subset. And a little more paid ones. I’ve chosen to pay. The font is [“21 cent”](https://www.letterhead.ru/Fonts/21cent.html) by [Letterhead Studio](https://www.letterhead.ru). Don’t know why, but I really like this font. I bought it from [myfonts.net](https://www.myfonts.com/fonts/letterheadrussia/21-cent/) — it’s nice they have it ’cause almost all other paid font providers are somewhat greedy — I don’t think paying monthly fee for a font is nice.

    The whole font story is really tough and long. You can guess if it would translate into an article someday.

2. Minimalism. I’ve already mentioned it at the birdsite — it’s very hard to make a minimalistic textual site and not fall into cloning great [iA’s site](https://informationarchitects.net). Some of the iterations I did for my site were dangerously close to that one. Maybe that’s not that bad after all, but I’ve stopped and tried to find what to do to make my site somehow stand out of similar ones. Minimalistic text-only sites are a trend, so it would be nice if my site would be recognisable in some way. Of course, it’s not finished, but I hope the shape can be seen.

3. Visual features. I’ll certainly write more posts on that, so only briefly now: look at the gamma and colors. I tried to reduce number of plain black and gray colors (and plain white too), using a small tint to everything. Also look at the header and footer (on desktop) — I know, it’s not a new effect, but I kinda liked it and wanted to use it there as it perfectly fits into theme. And look at the links — the colors, the visited ones and especially look at the small thingy that can be visible on the underline that appears on hover.

## Open Source

Despite the rough trashy code inside, the code of this site is on GitHub. Yeah, it’s needed for all this Jekyll magic to work, but there is also another thing: the power of open source. Anyone could go and fix all those awful mistakes I do while writing the posts in English (in a verrry bad English I guess, sorry!) — now it’s very easy. Every article on site have two links at the bottom: one for creating an issue on GitHub straight away — so you can point me to any errors or add something to the post, and if you’re that generous, there is a link to the article at prose.io — so you could go and fix it.

Those actions would be very fast as long as you have GitHub account, so I hope you would use it. Thank you in advance!

This whole idea on going open source for articles is great, so there would be a lot of articles on that coming.

## That’s it or tl;dr

Ok, so you can see the first post from a list of all those I’ll write — with a new site under them. It’s drafty, broken in a lot of ways and smells inside, but that would change someday. Everything would be better and better and I’ll try to cover all the changes I do either in articles, or just on mastodon.

So, thank you for reading this lengthy post (or scrolling till the end at least). Follow the updates, send pull requests and stay tuned!
