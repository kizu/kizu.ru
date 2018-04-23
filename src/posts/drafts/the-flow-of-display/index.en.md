# The flow of display

![How is this puzzle solved?](the-flow-of-display.jpg "{:width='756' height='382'}")

There are a lot of subtle nuances in CSS. Sometimes you look at the code and wonder “why is it working at all?!”, and as more experienced you become, the less often it happens.

A few days ago my collegues found a solution for one problem, but they couldn't tell _why_ is it working, and showed me the code. I couldn't tell it from the start too, but after a few minutes with it, I found the answer, and it was something I already knew, but in a new context.

So, I have a small quiz for you, with an answer later in the article: you have two elements with the same HTML context and the same CSS, applied to them. Both of them have some exact styles with `float:left` in their CSS. And the only thing that is different between them is that one of those blocks have `display:inline-block` and the other one have `display:block`.

Can you find out a case when the value of `display` on a block with `float:left` in CSS would matter?

You can add any styles (except for `float` and `display`, obviously) for those elements, and any HTML context or inner elements, but, again, the same for both.

I'd recommend you to think more about this and find out a solution by yourself. There would be an answer later in this post, but I think it is a nice problem to think on.

## Closer to the answer

The nice thing is that the effect that is happening there can be useful. That's where I stumbled upon it in the first place — in a solution for one complex problem (which my collegues found out, not me!)

The goal is to have an element in the end of the list that would go right after the last item, while the number of items should adapt to the available width. The only drawback of the above solution is that it need the last element to have fixed width, but it's not the point of the demo.

Here is a demo that uses the effect, described in this argicle, try to resize your browser and then guess what and why happens inside:

{{<Partial "the-flow-of-display1.html" />}}

Now I'll give you a hint: what could disable the effect of the `float`, but still would have `display` to have an effect on an element? There is one property you can add that would make all the difference.

It is…

…wait for it…

`position: absolute`!

## The flow

That's right, when we add `position:absolute` for those elements, we're disabling the behaviour of the `float`. And a lot of developers would think that `position:absolute` would discard the effect of the `display` as well… But it won't! At least, not completely.

There is one interesting place in the CSS specs that comes into play:

> whahahahahaha

This means that if our block with `position:absolute` don't have the `top`, `right`, `bottom` or `left` set, it would be placed in the flow as if it wouldn't have `position:absolute` and would be affected by its `display`! And as the `float` is discarded, the `display` matters, and when it matters is when our elements have something before them.

Look at this simple example:

{{<Partial "the-flow-of-display2.html" />}}

The `html` for those blocks is the same, with the only difference of the used classes:

``` HTML
<p>
  Hello
  <span class="a">A</span>
</p>
<p>
  Hello
  <span class="b">B</span>
</p>
```

And the CSS for them:

``` CSS
.a {
    float: left;
    display: inline-block;
    }
.b {
    float: left;
    display: block;
    }
.a,
.b {
    position: absolute;
    }

```

Yep, the `float` won't do anything there, and the difference in the flow are there because of the differences in `display`.

Wonderful! Think a bit about all this. Of course, the `float` is not needed there, but it was a nice disguise for the effect, as it is discarded on absolute positioning, but the `display` is not.

## The use case

Now I'll try to explain the case I shown above, I'll show you it once again (resize your browser, blah blah):

{{<Partial "the-flow-of-display1.html" />}}

What happens here (and what needed to be achieved) is that the last item from the list should be always on the first line, going after all the other items which are wrapped if they don't have enought place for them.

That was not an easy task, and I'm a bit ashamed that I didn't solve it by myself, but hey, at least I know how (and why) we can do it now!

The HTML for those items is this:

``` HTML
<ul class="just-some-items">
    <li class="just-some-item">One</li>
    <li class="just-some-item">Two</li>
    <li class="just-some-item">Three</li>
    <li class="just-some-item">Four</li>
    <li class="just-some-item">Five</li>
    <li class="just-some-item">Six</li>
    <li class="just-some-item">Seven</li>
    <li class="just-some-item">Eight</li>
    <li class="just-some-item">Nine</li>
    <li class="just-some-item">Ten</li>
    <li class="just-some-item">Eleven</li>
    <li class="just-some-item">…last</li>
</ul>
```

The CSS is this:

``` CSS
.just-some-items {
    overflow: hidden;

    height: 2em;
    padding-right: 2.4em;
    margin: 0;
    }
.just-some-item {
    float: left;

    margin-right: 0.5em;

    line-height: 2em;
    }
.just-some-item:last-child {
    position: absolute;

    display: inline-block;

    width: 2.4em;
    }
```

And even knowing all the above stuff, the “Aha!” moment was delayed a bit for me. What happens there is the following:

1. All the blocks are floated.
2. The last item have `position: absolute`.
3. When we add the `display:inline-block` (or, actually, `display:inline`, or `display:inline-flex`), the effect that was explained above happens. The last block is placed in the normal flow, while all the other elements are floated, this makes this element to be on the first line.

Actually, we don't even need the `position: absolute` there, we could have a normal `inline-block` here with the zero width and without the float, but as we want it to have an actual width and paddings and whatever, the `position:absolute` is really handy there.

