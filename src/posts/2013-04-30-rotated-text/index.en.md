# Rotated text

#Practical #Typography #CSS

Once I already shared this solution on twitter, but this time I’m going to write a bit more on it.

**The task** is to get the text rotated by 90 degrees.

**The problem**: it’s widely known that when you use `transform`, the block behaves similar to the `position:relative` — its place in the flow is not changed after the transformation, so the change is only visual.

However, rather often you’ll _need_ to rotate the block in a way the flow would change either. Like if we’d want to put some rotated blocks in a row, or if we’d want to have vertical headers in tables — in those cases we would need the height of the block to be its width after the rotate and vice versa.

I managed to make this work with one assumption — we would need to know the height of the rotated element. In such case the solution would be rather simple:

1. We would need to have an extra element. HTML for each block would be like this:

    ``` HTML
    <span class="rotated-text">
        <span class="rotated-text__inner">
            Rotated foo
        </span>
    </span>
    ```

2. Wrapper would get those styles:

    ``` CSS
    .rotated-text {
        display: inline-block;
        overflow: hidden;

        width: 1.5em;
        line-height: 1.5;
    }
    ```

    Here we make our element to be inline-block (that’s not critical, the block display would work too, but inline-block is often handier), then we remove all the extra things using overflow (we would need this later) and set the width to the current elements’ height — the mentioned assumption (and `line-height` is placed here as an example of what defines the blocks’ height).

3. Then we make the inner element to be inline-block too, so its width would be collapsed to its content. After this we make it have `white-space:nowrap`, so nothing would wrap (because of the fixed width in the previous step), and then we actually rotate the block from the left top corner using `transform-origin` (for readability the transform properties are given without proper prefixes):

    ``` CSS
    .rotated-text__inner {
        display: inline-block;
        white-space: nowrap;

        transform: translate(0,100%) rotate(-90deg);
        transform-origin: 0 0;
    }
    ```

4. And now the key part of my solution: we need to make this inner element to be _square_ — this would make the resulting element to have the height of its width, and the width would be equal to the assumed height on the wrapper. So, to make an element squarish we use this trick:

    ``` CSS
    .rotated-text__inner:after {
        content: "";
        float: left;
        margin-top: 100%;
    }
    ```

    Not that hard, but not a lot of people remember that top and bottom paddings and margins set in percents are using the width of the parent element, not its height. This behavior is not widely used, but here is a case where it’s useful at last.

So, in the end we got a square element, whose width is hidden by the overflow on wrapper and this element could be used in any context, so it would be affected by `text-align` or `vertical-align`. It is rather “fair” rotated block.

And just some basic examples of usage:

## Table headers

An obvious example — compact table headers what don’t take that much of horizontal space:

{{<Partial src="rotated-text.html" />}}

## “Bookshelf”

As all the rotated blocks have fair place in a flow, you could arrange them in a row so they won’t overlap each other and the height of the whole row would be equal to the “highest” of them:

{{<Partial src="rotated-text_books.html" />}}

So, that’s it.

Once again: we need to know the initial height of the rotated block, so if we’d need to rotate multiline blocks, we’d need to change their resulting width accordingly.

Also, this method could work in IE — by adding matrix filter and converting a pseudo-element to an actual one — but I’m lazy enough to do this. But if you’d like, you could try and make it by yourself :)
