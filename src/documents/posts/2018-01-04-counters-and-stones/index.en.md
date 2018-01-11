# Counters and Stones

Today's article is a bit special for me: I'll explain a solution which I couldn't find for more than four years. The problem is not very practical: it was one aspect of CSS-only stuff that could be much easier handled by JS, but I really wanted to find a clean HTML&CSS-only solution for. And I have found it. And in this article, I'll explain what was the problem and how the solution works.

But first, I need to say thanks to [Una](https://twitter.com/Una). I was browsing internets and found out myself looking at on one of her articles — [“Pure CSS Games with Counter-Increment”](https://una.im/css-games/). While I had read this article a few times before (I really like CSS experiments like that as you can guess!), this time something clicked. I remembered [one of my older unfinished experiments](*fronteers "I've mentioned this experiment in my old lightning talk [“Don’t look into the source”](https://fronteers.nl/congres/2013/jam-session/dont-look-into-the-source) at Fronteers 2013 Jam Session.") which was a bit similar to one of the games Una created, and how both our examples didn't solve one hard aspect. But looking at this article now, when I just wrote the article on [Flexible Overflow](http://kizu.ru/en/blog/flexible-overflow/), I looked at the “Counter-Increment” part and the puzzle in my head completed.

I'll explain the problem and the solution later, but now look at this, my now finished [experiment](*renju "This is a really basic implementation of [Gomoku](https://en.wikipedia.org/wiki/Gomoku) — a game where two players compete on who could purt five consecutive stones first. Only the very basic winning rules are implemented of course.") from the past:

[partial:13x13]

Things you can notice:

1. You can place “stones” by clicking/tapping on the line intersections.
2. When you place each new stone, the turn passes to another player.
3. When a player places five stones in a row, they win.
4. Everything there is done using just HTML&CSS, no JS involved.

Until recently, it was known how to achieve most of those points in CSS: you can see it in Una's games, for example. [Except](*except "**2018.01.10 update:** [Bence](https://twitter.com/finnhvman) [solved](https://twitter.com/finnhvman/status/916015929565302784) this problem independently in his [“Connect 4” game](https://css-tricks.com/roman-empire-made-pure-css-connect-4-possible/), in a very similar way, but with a few differences.") for the second point — passing turns ended up to be the hardest thing. When I did my demo for Fronteers, I had to pass turns manually, by doing an extra click after putting a stone. Una handled this by allowing 5 seconds for each player's turn, which is also far from ideal.

In this article, I'll show you how this can be handled in a way you'd need to click only once to put a stone to pass a turn.

The basic idea is that we need to have some kind of a logic switch, which we would use to change the states of our elements: turn them on and off. While this can be achieved by using the `:checked` state (and in a lot of cases it is still much better than what I'll describe there), for our case — when we'd need to change turns _at the same time_ when we place stones on a field it wasn't enough. We'd need to have something that would _toggle_ the state with each consecutive click on _different_ items. Here is what I came up with.

## Logic Unit

The main idea for our main building block is to use CSS _counters_. They have this unique property for CSS: you can increment them, decrement, and their values would be available all the way down the context they were declared at.

But here is a problem: we can't use them anywhere but the `content` CSS property. So, for a long time, I thought that — yeah cool — we can have those counters, but we couldn't use them for anything that deals with logic, only for visual stuff, like representing the number of things etc.

Until I looked at this:

    0
    42
    100

Those are integers that CSS counters are able to add to our HTML by using `content` property. Do you see it? Those numbers have different lengths. One symbol, two symbols, three symbols… That means that based on different values of a counter, it can actually affect the page's layout, as the generated content from them would have different widths. And as I played a lot with stuff that depends on the elements' widths in [my previous article](http://kizu.ru/en/blog/flexible-overflow/), when I noticed this I immediately thought of how that aspect of counters can be used!

If we would take our example that has a flexible overflow, then make it so it would have some fixed width, then we'd add the counter's content inside its “jumping down” part… Look:

[partial:logic-unit-draft]

You can see how when you click there, the checked input increments our counter by `100000`, and you can see how the flexible overflow makes this counter to jump down (I removed `overflow:hidden` from the container for you to see it) and our hidden content appears.

That is the basic idea: we use the counter to influence the display of an element, and when we use the input we didn't use any combinators like `+` or `~` to achieve it!

Now, you can see that it's kinda strange to increment by `100000` just in order for a counter to fit into our box. That is really easy to solve in a way we'd need to change one order of counter to achieve the same:

[partial:logic-unit-shorter]

You can see how not only it works with just changing from 0 to 10, but it also works with any width.

I achieved this by reducing the inner width of the element containing the counter in a way it could fit only one digit:

    box-sizing: border-box;
    padding-left: calc(100% - 1.5ch);
    
    {:.language-css}

I'm using the `1.5ch` instead of `1ch` there to ensure there won't be any weird stuff happening on the edge values: 1 digit would always fit `1.5ch`, and two digits would always overflow it.

You can remember what `ch` stands for from [the specs](https://www.w3.org/TR/css-values-3/#ch):

> ‘ch unit’ — equal to the used advance measure of the "0" (ZERO, U+0030) glyph found in the font used to render it.

And that's exactly the unit we'd like to use there.

### The code

Here is the source for this last example. HTML:

    <input class="logic-unit" type="checkbox" id="LogicUnit"
    /><label for="LogicUnit"> Click me!</label>
    <span class="overflower">
      <span class="overflower-short">
        🙀 🙀 🙀
      </span>
      <span class="overflower-long">
      </span>
    </span>
    {:.language-html}

And CSS (with some unneeded visual stuff omited):

    .logic-unit:checked {
      counter-increment: logic-unit 10;
    }

    .overflower {
      display: flex;
      flex-wrap: wrap;
    }

    .overflower-short {
      overflow: hidden;
      flex-grow: 1;
      width: 0;
    }

    .overflower-long {
      flex-basis: 100%;
      box-sizing: border-box;
      padding-left: calc(100% - 1.5ch);
    }

    .overflower-long:before {
      content: counter(logic-unit);
    }
    {:.language-css}

### And, Or, Not, Xor

The best thing with counters: we can use multiple counters at the same time. That means, we can try to implement some logic for multiple counters!

[partial:logic-unit-and-or]

We achieve this by setting different starting values for our counters and by allowing a different amount of digits to fit it:

- For **AND/OR** we need to overflow only on 3 digits. Any new digit would be enough.
- For **AND** we need to overflow only on 4 digits. We would need to have both counters set.
- For **NOT** we need to invert the logic and start from the longer number, decreasing it later.
- Finally, **XOR** is achieved by playing with the numbers a bit so any counter would add a digit, but addition of another one would reduce it back.

All of this can be achieved for any number of counters, and the best part is that we don't need to know how those counters would be set.


## Board Game

All of this allows us to do a lot of interesting stuff. In our game these basic logic units are used for:

1. Passing a turn from one player to another.
2. Setting a “checked” state for each stone's label.
3. Disabling a stone of another color from being placed in the already filled-in space.

### Passing a Turn

So, how is the passing of a turn implemented? It's rather simple: we need to toggle the state of our counter that tells which turn it is:

    .board {
      counter-reset: White 0 Black 10;
    }
    .board > input:checked {
      counter-increment: White 10 Black -10;
    }
    .board > input[id^=White]:checked {
      counter-increment: White -10 Black 10;
    }
    {:.language-css}

Here we handle this for each color, so it would be easier to use later:

    .board > section > label > span:after {
      content: counter(Black);
    }

    .board > section > label[for^=White]:after {
      content: counter(White);
    }
    {:.language-css}

Our board has two layers of labels: one set for white stones, and another — for black ones. They're positioned one over another, so what we would need to do next is to hide each other layer on each other's turn. And our overflower mechanism allows us to do it. Then we add `visibility: hidden` on all items of a layer, and restore it using `visibility: visible` only on the part that would be shown on each turn. All of this makes it so only the proper labels are clickable at each moment, and with each click things change.

### Checked state

This is a part that could be implemented in a different way, [for example](*selectors "Or by using 338 selectors for each input-label pair. It would be effective, but not that interesting."), by using the `:checked` alongside a lot of `+` combinators. But there are two problems: it would be harder to handle all the stuff for labels, as they would need to be on the same level, and as I found out, Edge has a limit for a number of combinators that can appear in any given selector — 63. Edge won't like [this selector](*manycombinators "There are 337 stars — calculated as 13 columns × 13 rows × 2 − 1."):

    :checked+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+label
    {:.language-css}

So, in order to be more browser-compatible, and to play more with counters, I've implemented the checked state using them. But how? Wouldn't we need to declare a counter for each input and then somehow connect them to labels?

Here is when [inline styles and CSS variables](*inline "I really like how you can use CSS variables in inline styles, and I'm working on an article to showcase just that, so keep tuned!") comes into play:

    <input id="Black1" type="radio" style="--stone:B1;"/>

    <label for="Black1" style="--stone:B1;"><span></span></label>
    {:.language-html}

Those are HTML for an input and a corresponding label. Notice the inline style that has the B1 identifier. We now can use it in CSS, so, when we check an input, we need to set more counters:

    .board > input:checked {
      counter-increment: White 10 Black -10 var(--stone) 10;
    }
    .board > input[id^=White]:checked {
      counter-increment: White -10 Black 10 var(--stone) 10;
    }
    {:.language-css}

Note how we can use a CSS variable to pass the identifier of a counter that we want to increment! That works, as well as the following calling of the counter inside our label:

    .board > section > label > span:after {
      content: counter(var(--stone));
    }
    .board > section > label:after {
      content: counter(Black) counter(var(--stone));
    }
    {:.language-css}

Here we use the logic unit for this counter inside the label (notice how useful is the inheritance of the CSS variables: we can catch it on the inner span's pseudo-element), and also as an **OR** for our label, so we would see it both on the appropriate player's turn, and when it is checked.

What is also interesting here is that we don't need to _declare_ any of those counters — `counter-increment` is enough and by doing so we can create any number of counters right in your HTML (though, I can imagine there can be some limitations).

### Disabling Other Stones

The only thing left now is to disable the stone of another color that is placed at the same spot. With other methods for passing `:checked` state we could use other CSS properties, like just using `z-index` to place our checked label over anything else. But our counter logic allows us to only handle the width, and that is not what we can use for this purpose.

But we can use the logical **NOT**! So, each stone would know which other stone to disable:

    <input id="Black1" type="radio" style="--stone:B1;--notstone:W1;"/>
    {:.language-html}

And then we'd change the counter logic a bit:

    .board > input {
      counter-increment: var(--stone) 10;
    }
    .board > input:checked {
      counter-increment: White 10 Black -10 var(--stone) 100 var(--notstone) -10;
    }
    .board > input[id^=White]:checked {
      counter-increment: White -10 Black 10 var(--stone) 100 var(--notstone) -10;
    }
    {:.language-css}

By doing this, when we check one stone, it would make it so another stone won't achieve its turn state and would always be off!

In the final example of the game at the start of this article you can see that we use the turn state in one other place: for displaying which player's turn is now — and that's a really nice feature of our method: once added, we can then later use those counters as we'd seem fit.

### Win Conditions & Other Stuff

Here are a few other fun things about our board game:

1. We can use `<button type="reset">` to, well, reset the game state when we'd want, as it would reset all our inputs.

2. Our inputs are in fact `radio` inputs. And you can notice the absence of the `name` 
attribute: this is important, as we don't want to have any _groups_ of inputs, and we don't want for any checked input to be able to become unchecked on the following click on its label.

3. We have implemented a win condition: 5 consecutive stones of any color.

This last win condition is a thing that I couldn't find a counters solution for. Well… there were some ideas, but all of them would have some serious drawbacks. So I've used the win condition based on combinators. Here are the selectors that determine which player would win:

    .board > :not(:nth-child(13n-0)):not(:nth-child(13n-1)):not(:nth-child(13n-2)):not(:nth-child(13n-3))[id^=W]:checked + :checked + :checked + :checked + :checked ~ footer,
    .board > :not(:nth-child(13n+1)):not(:nth-child(13n+2)):not(:nth-child(13n+3)):not(:nth-child(13n+4))[id^=W]:checked +*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+:checked ~ footer,
    .board > [id^=W]:checked +*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+:checked ~ footer,
    .board > :not(:nth-child(13n-0)):not(:nth-child(13n-1)):not(:nth-child(13n-2)):not(:nth-child(13n-3))[id^=W]:checked +*+*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+*+:checked ~ footer {
      --endgame: grid;
      --endmessage: 'White won!';
    }

    .board > :not(:nth-child(13n-0)):not(:nth-child(13n-1)):not(:nth-child(13n-2)):not(:nth-child(13n-3)):checked + :checked + :checked + :checked + [id^=B]:checked ~ footer,
    .board > :not(:nth-child(13n+1)):not(:nth-child(13n+2)):not(:nth-child(13n+3)):not(:nth-child(13n+4)):checked+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+ [id^=B]:checked ~ footer,
    .board > :checked+*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+ [id^=B]:checked ~ footer,
    .board > :not(:nth-child(13n-0)):not(:nth-child(13n-1)):not(:nth-child(13n-2)):not(:nth-child(13n-3)):checked+*+*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+*+:checked+*+*+*+*+*+*+*+*+*+*+*+*+*+ [id^=B]:checked ~ footer {
      --endgame: grid;
      --endmessage: 'Black won!';
    }
    {:.language-css}

- In each selector group the first one is determining the condition for 5 stones in a horizontal row [⋯], the second one — for first diagonal [⋰]︎, third — 5 stones in a vertical column [ ⋮ ], and the last one — for another diagonal [︎⋱].
- Each selector except for the vertical one has an extra condition that prevents the false positives. Those are possible, as our rows are not isolated and the stones go one after another, so five stones in a row could be matched when some of them are in different rows.
- We can omit most of the extra stuff, but in order to properly determine which stones are selected, we need to either check the color of the first or last one in a selector.

### Scaling and Edge bugs

This kind of selectors can be done for a board of any size and for any number of consecutive stones to win, however, there is Edge. It won't allow us to have selectors with [63 or more combinators](*combinators "Combined, of any kind, you can see the reduced case in this [codepen](https://codepen.io/kizu/pen/aEydrr) — the selector which have 62 combinators is applied in Edge, but the one containing one extra is not."). Look at this:

    [id^=W]:not(:nth-child(15n-3)):not(:nth-child(15n-2)):not(:nth-child(15n-1)):not(:nth-child(15n)):checked + *+*+*+*+*+*+*+*+*+*+*+*+*+*+* + :checked + *+*+*+*+*+*+*+*+*+*+*+*+*+*+* + :checked + *+*+*+*+*+*+*+*+*+*+*+*+*+*+* + :checked + *+*+*+*+*+*+*+*+*+*+*+*+*+*+* + :checked ~ p
    {:.language-css}

It is a selector for one of the conditions for the 15×15 grid, and that condition won't work in Edge. So, basically, our board game _still_ could be played there — the counters conditions would work — but we would need to determine who won manually.

This is a case where I'd really like to see a way in CSS to say “skip N consecutive elements” or “skin N wrappers”, or nth- variants of the `+` and `>` combinators. While this would help with an Edge problem (which should be fixed anyway, in my opinion), I often see cases like this or similar, where we need to skip a predetermined number of elements or wrappers, and right now the only tool we have is that clunky rows of stars. And it would be nice to have something better.

### Generated Boards

When I was playing with all of that, I created [a Codepen](https://codepen.io/kizu/pen/goLLdp?editors=1000) that generates HTML for our boards based on the number of columns and rows, so you can test different layouts and see how, for example, 3x3 or 19x19 would work (or not — in Edge).

A few things to note:

- The only CSS generated (from Pug, so no need in CSS-preprocessor) are those win conditions.
- Everything else is handled by CSS variables.
- I set the number of columns and rows from pug as inline CSS variables, so you can just change those two numbers and get the result!
- Some of the board layouts are untested, for example, the board is drawn using CSS gradients, and not everything could work perfectly on each board size.

## Conclusion

It was very fun for me to play with this newfound way to express logic in CSS. It is sad that there are a lot of drawbacks with it: that its only appliable for handling stuff that is based on element's dimensions, and what we can't use transitions anywhere. But yeah, completing an experiment started in 2013 was really nice.

And what would be also very nice is to have something like that in CSS natively. Maybe Tab Atkins' ideas about [Toggle States](https://tabatkins.github.io/specs/css-toggle-states/) would be there someday? We can only dream. Go and ping your spec authors and browser developers, create your examples of handling logic in CSS (I can see how these logic units could be used for form validation, for example), and let us move CSS forward, so we would have even more stuff to play with.
