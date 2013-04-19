---

categories: en issues

layout: post

published: true

invisible: true

---

# Markdowning YAML for Jekyll

While I'm struggling to write a lengthy article, here is a small one, on a few Jekyll tricks I use.

The first one is on how to mark up YAML prologue in a _readable_ matter. Well, not readable actually, but renderable by markdown.

Why would I need this? I though it would be cool if the .md file looked nice on GitHub. Right now if you'd just write YAML in a simple way, like this:


    ---
    layout: docs
    title: Resources
    prev_section: sites
    ---

You would get ugly header for your file at GitHub:

![Bad code][bad]

This is easy fixable, just try to write YAML front matter in a markdowny way: add extra empty lines etc. then the example above would be restyled to this:

    ---
    
    layout: docs
    
    title: Resources
    
    prev_section: sites
    
    ---

And it would look so much better at GitHub:

![Good code][good]

As an added bonus I find this style of YAML better readable in a code editor also, so there is virtually nothing that should stop you from using this code style for your YAML front matters. If you didn't had any code style, then adding any one would already be useful enought btw!



[bad]: http://img-fotki.yandex.ru/get/6430/1076905.1/0_9789a_239b2fc2_orig.png
[good]: http://img-fotki.yandex.ru/get/5625/1076905.1/0_97899_16bfcbbf_orig.png