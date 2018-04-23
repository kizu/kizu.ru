# Label-to-Input States

When fiddling with inputs & labels for them, I remembered one thing that amused me [for a long time](*for-a-long-time "Fun fact: when I started the research for this article, I found [this question](https://stackoverflow.com/questions/9098581/why-is-hover-for-input-triggered-on-corresponding-label-in-css) at StackOverflow, with a really detailed answer by BoltClock. The fun part is that I was the one who asked this question at this far February of the year 2012, and now totally forgot about it. Also, the “Even more” part of this question is still actual for Webkits/Blinks."). Look at this HTML:

    <label>
        Here is an input: 
        <input type="text" />
    </label>

    {:.language-html}

The fact that amuses me is that when you declare a state for an input in CSS, like with `:hover` or `:active` pseudo classes, and then you have a label for that input, then triggering those states over the label would actually trigger the same states on the input.

Here is an excerpt from the [latest Selectors Level 4 spec](https://drafts.csswg.org/selectors-4/#the-hover-pseudo):

> Document languages may define additional ways in which an element can match :hover. For example, [HTML5] defines a labeled control element as matching :hover when its label is hovered.

Here is a simple example of this behaviour:

[partial:1]

If you're using any modern browser, you could see the input to be highlighted both when you hover the input itself and the label associated with it.

The CSS for this example is trivial:

    input.example:hover {
      background: lime;
    }

    {:.language-css}

## But What About Ancestors?

If you'd look at that place about the hover in [the spec](https://drafts.csswg.org/selectors-4/#the-hover-pseudo), you'd see the following sentence above:

> An element also matches :hover if one of its descendants in the flat tree (including non-element nodes, such as text nodes) matches the above conditions.

Which is a thing you could possibly already know: when you hover over a descendant, then this state is also triggered [on all the ancestors](*all-of-them "Even if the element is out of the ancestor's bounds, like being positioned or moved outside using some other method, and even if the ancestor would have `pointer-events: none` or `display: contents`, it still would be marked as the one having the same state as the descendant."), which can be used in a lot of useful ways.

But what if we have those connected label and input, and the label would be placed not in one of the input's ancestor's flat tree?

Like this:

    <ul>
        <li>
            Here is
            <label class="example-label" for="Example2">a label</label>
            for the input inside another list item. Hover it!
        </li>
        <li>
            And here is the input for the above label:
            <input class="example" id="Example2" type="text" />
        </li>
    </ul>

    {:.language-html}

And if we'd add the same CSS as for the example above, we'd get the same result:

[partial:2]

For now the result is the same. But there is one big difference. Let's add some styles like this:

    ul.example3 > li:hover {
        box-shadow: 0 0 0 3px blue;
    }

    {:.language-css}

Now look at the following example and try to hover over the input itself and the associated label:

[partial:3]

You should see there that, as probably expected, only the actual list item that is hovered would obtain the above styles. Giving the input the `:hover` state using the label trick won't trigger the `:hover` over its parent. All like was written in the specs.

And what this also means is that as we have this behaviour, the following selector that could look like nonsense at the first glance would actually mean something:

    :not(:hover) > input#Example4:hover {
      background: blue;
    }

    {:.language-css}

If we'd take our first example and would just wrap an input into a simple span:

    <span><input class="example" id="Example4" type="text" /></span>
    
    {:.language-html}

This new selector would actually target [only](*not-only "Actually, there is at least one other way to trigger it — by using the developer tools and checking the `:hover` state only for the input there. And if you'd find out other cases where this would work — please, report them to me!") the hover state of this input that is caused by hovering over label.

And that means that we can now actually style both hover states in different ways!

Here is that example working:

[partial:4]

## Selecting Siblings

As with a lot of other places in CSS, you could research a lot of things surrounding this behaviour. For example, not only the `:hover` state can be delegated this way, but also at least the `:active` one.

But I'd like to mention one nuance that could be rather useful, but which is prevented by IE/Edge not supporting it.

As we saw, the parent is, per spec, won't get the hover state of such delegated `:hover`. But what if we'd want to use this `:hover` as a prerequisite to something else? What if we would add a combinator after it and then would try to select some siblings that will come after the input?

Like this:

[partial:5]

In Firefox and browsers based on Webkit/Blink you could see the link that goes after the input to be highlighted even when you hover the label inside another list item! In Edge, sadly, nothing happens there.

And, as in the browsers that support it, this behaviour would work even if the input is disabled, we then could hide it using the often used technique (using `clip` etc.), and then use labels at one part of the page to highlight stuff at any other part of the page without any JS. What fun could we get out of it?

## Breaking the Specs in the End

The most <input disabled aria-hidden="true" class="lol-example" id="Example6-5" type="radio" /><span class="example-target">fun</span> thing what I found when doing quick experiments <input disabled aria-hidden="true" class="lol-example" id="Example6-6" type="radio" /><span class="example-target">is</span> this:

[partial:6]

Sadly, there I used the <input disabled aria-hidden="true" class="lol-example" id="Example6-7" type="radio" /><span class="example-target">forbidden in specs</span> nesting of labels inside other labels (which we could actually overcome in terms of _validity_ using either the method for [nesting links](:nested-links) or by DOM manipulation), which surprisingly works as we'd expect: you hover one (visually) item, and then you get visual feedback from any number of places all over the page.

Imagine if this would be the thing we could use without hacks and without relying on the label-to-input state delegation.

And here we have it _implemented_ in some way, so its entirely possible to do in browsers and we'd only need the specs to support it? What do you think, do we need a way to delegate states from one element to another in native CSS? If you think that we need, tell your fellow spec writers and/or browser vendors, or even come up with a draft of what it could look like in a spec by yourself!

There is a _chance_, that such stuff would be possible with extensive usage of `:has()` ([at the same spec](https://drafts.csswg.org/selectors-4/#relational)) if it would be ever implemented, but yeah, only if it would be ever implemented.
