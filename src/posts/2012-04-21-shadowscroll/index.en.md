# Scrolling shadows

#Experiment #Practical #CSS

Here’s an old idea, but recreated with pure CSS.

Originally, I had an extra wrapper and two extra pseudo-elements on it. Later I decided to rewrite the code and to use just a single element (by using radial gradients).

While this method is simple, there are some limitations:

* the background must be solid[^solid]
* there are some positioning issues

[^solid]: However, if you'd try `background-attachment: fixed`…

But in most regards this method is rather bulletproof.

If you replace the CSS-gradients with simple images, this method could work in IE. (It might need a few more small fixes; I didn't check.)

Enjoy!

**Update:** [Lea Verou](https://lea.verou.me/) updated this experiment using the `background-attachment: local`. [Read about it in her post](http://lea.verou.me/2012/04/background-attachment-local/).

{{<Partial src="shadowscroll.html" style="font: initial;" />}}
