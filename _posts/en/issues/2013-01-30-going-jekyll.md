---

title: Jekyll

categories: en issues

layout: post

---

{% include setup.md %}

In a [post on site relaunch](http://kizu.ru/en/issues/restart/) I told I’ll write a lot of articles on Jekyll. That’s the first post in the serie, an introduction.

I won’t write on how to install [Jekyll](https://github.com/mojombo/jekyll), how the files are structured there, and so on — there are already a lot of articles on that (look for some at the [__ links __](#links){:quoted}). To describe Jekyll briefly, it’s a blog-aware static site generator. An awesome one.

## GitHub Pages

I need to tell one thing from the start: this and all other future articles would be in the context of [GitHub Pages](http://pages.github.com). While GitHub allows you to host any static sites on it, there is also a way to host sites wrote with Jekyll. So, the Jekyll is the only way to actually generate something right at GitHub without use of any other services or any front-end solutions.

With Jekyll you can just create a file in markdown, add a YAML front matter to it — and start writing. After pushing this file to the repo on GitHub, the whole site would be regenerated and you’ll see the corresponding post both as a page on your site and in all the listings on other pages as well. And you could push your changes from any place: you could even use just GitHub’s site for this or any web app using GitHub’s API.

And another thing I need to mention right from the start: a lot of things I’ll describe in the next articles could be made _so mush_ easier using plugins. But I won’t go an easy way — I’d like to make everything in a way more people could use it: even in places where the plugins are disabled — as on GitHub Pages. 

## “Hello world”

Minimal document you’ll need to generate a site on Jekyll should contain the [YAML](http://en.wikipedia.org/wiki/YAML) front matter with at least one field — `layout` (you could actually make one without it, with empty YAML front matter, but in that case your page won’t have any layout at all). So, the minimal `hello-world.md` for Jekyll would look like


    ---
    layout: default
    ---

    Hello world!

In real world you’d like to add at least a title or some other data, but for the most trivial cases that’s the minimal code to start from.

## Dates

One of the features I like in Jekyll is its format for posts. You need to name the files as `YYYY-MM-DD-title` and I think that’s awesome. It makes you to maintain a better file hierarchy that would be sorted by date automatically, and also you won’t need to write the date in the post itself — Jekyll would use the date from the filename. Yes, in some cases you’ll want to use the `published` field in YAML to override the date from the filename, but it’s up to you. In most cases you won’t need it.

## Prose.io

And if you don’t like to fill up YAML by yourself, and you don’t want to use any scripts for it (like it’s done in Jekyll Bootstrap), you could use a service like [Prose.io](http://prose.io). This awesome service allows you to [describe all the metadata defaults](http://prose.io/help/handbook.html#metadata_defaults) in a config, so when you’ll create a new post using Prose, all the metadata would be filled for you (actually, in most basic cases you’d need to at least look at the metadata, but that’s another story I’ll tell someday later).

## Links

There is a lot of useful info in the internets on Jekyll, I’ll try to sum all the useful links in this post for you (and for myself). There are links that would help you to start with Jekyll, and the links that are useful all the time you’re tinkering with the logic behind Jekyll’s templates.

- [Jekyll’s official site](http://jekyllrb.com);
- [configuring Prose.io for Jekyll](http://prose.io/help/handbook.html).

There are also a lot of helpful pages on Jekyll in the [Jekyll Bootstrap](http://jekyllbootstrap.com) project. I found those ones to be the most useful:

- [Introduction to Jekyll](http://jekyllbootstrap.com/lessons/jekyll-introduction.html);
- [template data API](http://jekyllbootstrap.com/api/template-data-api.html).

Jekyll uses [Liquid](http://www.liquidmarkup.org) for templating. GitHub recently [updated Jekyll](https://github.com/blog/1366-github-pages-updated-to-jekyll-0-12-0), so now you could use almost all the tags from the docs:

- [list of all the default liquid tags](https://github.com/shopify/liquid/wiki/liquid-for-designers);
- [extra liquid tags available in Jekyll](https://github.com/mojombo/jekyll/wiki/liquid-extensions).

Before this update you could’t use the powerful `split` tag — almost the only way to make a lot of different things with Jekyll (guess what — there would be some article on me hacking with that tag).

For writing posts I recommend to use markdown. While there are other ways, like plain HTML or Textile, for most cases the markdown would fit the best.

- As markdown engine I’d recommend to use [kramdown](http://kramdown.rubyforge.org) — it’s the best option so far, I’d write why in one of the next articles.
- For configuring the site or any specific post you’ll need to use [YAML](http://en.wikipedia.org/wiki/YAML) — so if you’re not familiar with its syntax — go and read about it, it’s nice.

Overall, I’m very happy I’ve chosen the Jekyll for my new site. There are a lot of issues with Liquid templates, but the overall result worths it.
