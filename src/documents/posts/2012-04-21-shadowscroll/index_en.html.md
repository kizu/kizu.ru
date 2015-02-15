---

categories: en fun

---

# Scrolling shadows

Here’s an old idea, but recreated with pure CSS.

Originally, I had an extra wrapper and two extra pseudo-elements on it. Later I decided to rewrite the code and to use just a single element (by using radial gradients).

While this method is simple, there are some limitations: 

* the background must be solid
 - however, if you'd try `background-attachment: fixed`…)
* there are some positioning issues

But in most regards this method is rather bulletproof. 

If you replace the CSS-gradients with simple images, this method could work in IE. (It might need a few more small fixes; I didn't check.)

Enjoy!

**Update:** [Lea Verou](https://twitter.com/leaverou) updated this experiment using the `background-attachment: local`. [Read about it in her post](http://lea.verou.me/2012/04/background-attachment-local/).

[demo:shadowscroll]