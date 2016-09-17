# Conditions For CSS Variables

I'll start from this: [there are no](*not-those "There is a module named “[CSS Conditional Rules](https://www.w3.org/TR/css3-conditional/)”, but don't expect it to cover the CSS variables — it covers some at-rules stuff. There is even a [proposal](https://tabatkins.github.io/specs/css-when-else/) for `@when`/`@else` at-rules, which, again, do not anything in common with variables.") conditions in specs to use with [CSS variables](https://www.w3.org/TR/css-variables-1/). This is a really big flow in CSS variables, as while they already provide a lot of things that were not possible in any other way before, the absence of conditions is really frustrating. I don't know why there are no conditions.

But what if we'd need the conditional statements for our CSS variables _now_? Well, as with a lot of other CSS stuff, we can hack our way around in same cases.


## The Problem's Definition

So, what we need is a way to use a single CSS variable for setting different CSS properties to _different_ values, but not based directly on this variable. So — we need conditions.


## Using Calculations for Binary Conditions

Long story short, I'll just present the solution to you right now and would explain it later:

    :root {
        --is-big: 0;
    }

    .is-big {
        --is-big: 1;
    }

    .block {
        padding: calc(
            25px * var(--is-big) +
            10px * (1 - var(--is-big))
        );
        border-width: calc(
            3px * var(--is-big) +
            1px * (1 - var(--is-big))
        );
    }

    {:.language-css}

In this example we're making all our elements with `.block` to have paddings equal to `10px` and border widths to `1px` unless the `--is-big` variable on those elements won't be `1`, in which case they would become `25px` and `3px` respectively.

The mechanism beyond this is rather simple: we use both our possible values in a single calculation, where we nullify one and keep another value based on the variable's value which can be either `1` or `0`. In other words, we'll have `25px * 1 + 10px * 0` in one case and `25px * 0 + 10px * 1` in another.


## More complex conditions

We can use this method to choose not only from 2 possible values (`0` or `1`), but for choosing from 3 or more values. However, for each new added possible value the calculation becomes more complex. For choosing between 3 possible values it would already look like this:

    .block {
        padding: calc(
            100px * ((1 - var(--foo)) * (2 - var(--foo)) / 2) +
             20px * (var(--foo) * (2 - var(--foo))) +
              3px * (var(--foo) * (1 - var(--foo)) / -2)
        );
    }

    {:.language-css}

This would accept `0`, `1` and `2` values for `--foo` variable and calculate to `100px`, `20px` or `3px`.

The principle is easy: we just need to multiple each result to a number that would be equal to `1` when the condition for this result is true and to `0` when false, and this multiplier can be composed rather easily: we just need to nullify each other possible value of variable and then modify what would be left so it would be equal to `1` when we'd have our expected value.

### A Possible Trap in the Specs

With the increacing complexity of such calculations there is a chance at one point they would stop from working. Why? There is this note in [specs](https://drafts.csswg.org/css-values-3/#calc-syntax):

> UAs must support calc() expressions of at least 20 terms, where each NUMBER, DIMENSION, or PERCENTAGE is a term. If a calc() expression contains more than the supported number of terms, it must be treated as if it were invalid.

While I tested a bit and hadn't found any limitations in the browsers I tested, there is a chance either you would write some really complex code that would meet the existing limit, or some of the browsers could introduce this limit in the future, so be careful when using really complex calculations.

## Conditions for Colors

As you can see, those conditions could be used only for things that you can _calculate_, so there is no chance we could use it for switching the values of `display` property or any other non-numeric ones. But what about colors? Actually, we can calculate the individual components of the colors. Sadly, right now it would work only in Webkits and Blinks, as Firefox don't support `calc()` inside `rgba()` and other color functions yet.

But when the support would be there, we could do things like that:

    :root {
        --is-red: 0;
    }

    .block {
        background: rgba(
            calc(
                255*var(--is-red) +
                0*(1 - var(--is-red))
                ),
            calc(
                0*var(--is-red) +
                255*(1 - var(--is-red))
                ),
            0, 1);
    }

    {:.language-css}

Here we'd have lime color by default and red if the `--is-red` would be set to `1`.

As you could do those calculations with any components, it is possible to create those conditions for any colors.

## Preprocessing

When the conditions are binary it is still possible to write them by hand. But when using more complex conditions or if we'd get to the colors we'd better have tools that could make it easier to write those conditions. Luckily, we have preprocessors for this purpose.
