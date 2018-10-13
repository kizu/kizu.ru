# Markdowning YAML for Jekyll

#Blog #Meta #Jekyll

While I’m struggling to write a lengthy article, here is a small one, on a little Jekyll trick I use.

In Jekyll you need to use YAML front matter to add any metadata to the post or page. Actually, Jekyll “sees” only those files that have the YAML front matter, so it is a somewhat important thing.

Most of the time this front matter would look like this:

``` YAML
---
layout: docs
title: Resources
prev_section: sites
---
```

It could seem to be ok. However, as I use Jekyll right on GitHub, my perfectionism tells me that the source of all my posts in markdown should look perfect when looked at GitHub. And it would render all the markdown documents instead of showing their content. So, the YAML front matter in that case would look like this:

![Bad code][bad]

Not that readable, huh? And the last line suddenly became a header — I don’t think it’s what we could want there.

However, it can be fixed with ease: you just need to add some extra lines in-between:

``` YAML
---

layout: docs

title: Resources

prev_section: sites

---
```

And this would look so much better at GitHub:

![Good code][good]

Instead of a useless header we would get YAML nicely separated from content, and every line would become a paragraph there.

As most of posts won’t have a lot of metadata, those extra lines won’t bloat the code. And, in my opinion, this code style is also more readable when you’re working with actual code, so I don’t see any reasons why you shouldn’t use it all the time for YAML front matters.

The only thing I don’t like there is that YAML is so strict. You can’t add indents in the front of data, or use lists with hyphens here — those could be rendered even nicer. Also, if someone would see any other possibility to enhance the readability of the YAML front matters — tell me via twitter or by issues on GitHub.


[bad]: http://img-fotki.yandex.ru/get/6430/1076905.1/0_9789a_239b2fc2_orig.png
[good]: http://img-fotki.yandex.ru/get/5625/1076905.1/0_97899_16bfcbbf_orig.png
