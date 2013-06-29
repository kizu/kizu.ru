---

categories: en blog

layout: post

published: true

---

# Updated Jekyll

Not that long ago Jekyll become that big — version “1.0” [was released](https://github.com/blog/1502-jekyll-turns-1-0).

There are a lot of stuff in [the changelog](https://github.com/mojombo/jekyll/blob/master/History.markdown#100—2013-05-06): there are new features, there are a lot of fixes. You can read what's the most important [in this article](http://jekyllrb.com/docs/upgrading/).

I moved my site to this version. Well, not actually _moved_ — everything worked anyway, but there were some stuff in a new version that I could use to make things in a better way. So, I'll write a bit on what I personally liked in this new version.

## `page.path`

It's one of those things I wanted the Jekyll to have — I even [pinged developers a bit](https://github.com/mojombo/jekyll/issues/633#issuecomment-11678912) in a corresponding issue at GitHub.

Old version of Jekyll had one flaw: there were no ways to retrieve the path of the source files for pages or blog posts. Why is this important? The blog or a site that's hosted at GitHub would profit a lot from giving a way for its users to edit the content. To make it really easy it would be handy to provide a link that would go either straight to the GitHub's edit file page, or at any other service that provides such possibility, like prose.io (which I use). This link would need to have the url to the source encoded in it; without proper method to do it there were only the dirtiest hacks available to implement this behavior.

And now it became really simple — the data of the posts and pages now contains the `path` variable, which contains the path to the source of the page. Hooray!

## Absolute permalinks

Permalinks set in YAML front matter were relative before. Even more, you couldn't set them to point at the upper levels, like using `../` (or I couldn't find how to make it work). But in a new Jekyll you could use absolute permalinks. Actually, right now, in 1.0, you need to enable them in the config using `relative_permalinks:false`, but with 1.1 this would be the default behavior. So, if you're using relative permalinks now and don't want them to become absolute at one moment, you'll need to either change them to absolute ones, or just set the `relative_permalinks:true`, so nothing would go wrong when 1.1 would be there.

Absolute permalinks made a lot of things easier for me — I could move all index pages for categories etc. to a single folder, for example.

## Changed syntax in CLI

New Jekyll comes with changed syntax in CLI, and one of the most interesting features is an ability to use additional configs.

If you'd like to run Jekyll with both the default config `_config.yml` and an extra one, like `_config-dev.yml`, you could run Jekyll this way:

    jekyll serve --config _config.yml,_config-dev.yml

Using this you could easily set up the dev environment, where you could change the absolute urls to be localhost, turn on the display of the drafts and do anything extra that won't show up in the production.

## Drafts

In new Jekyll you could create proper drafts. If you'd create a `_drafts` folder, its content won't render by default, but if you'd run your local copy with `--drafts` key in CLI, the content of the drafts would be rendered like if it had been placed in the `_posts` directory. One useful thing here is that you won't need to set the date in the posts' filename, and when you'd need to publish the draft you'll just need move the post from the `_drafts` to the `_posts` and add the date to its filename.

While I'm not using such drafts right now, it's looking like a nice feature, so I'll think if it could be used for my site.

## Other stuff

There are a lot of other things mentioned in [the changelog](https://github.com/mojombo/jekyll/blob/master/History.markdown#minor-enhancements-3), but all that matters for me I mentioned in this post.

Overall, I'm happy to use Jekyll 1.0 now and recommend it to anyone — it become a bit easier to use with all the new stuff.