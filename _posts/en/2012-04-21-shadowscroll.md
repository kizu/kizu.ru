---

title: Scrolling shadows
layout: post_dabblet
categories: [en, fun]

---

Here is some old idea, but made only with pure CSS.

At first there was a variant with extra wrapper and two extra pseudo-elements on it, but then I rethought the code and made it all just on a single element by using radial gradients.

While this method is simple, there are some limitations: the background must be solid (however, if you'd try background-attachment: fixed…), there are some positioning issues, but in other ways this method is rather bulletproof. And if you'd replace the CSS-gradients with simple images, this method could work in IE (maybe with some extra small fixes, I didn't check).

Enjoy!

**Update:** [Lea Verou](https://twitter.com/leaverou) updated this experiment using the `background-attachment: local`. [Read about it in her post](http://lea.verou.me/2012/04/background-attachment-local/).

**[Demo at dabblet №2432327](http://dabblet.com/gist/2432327/)**
