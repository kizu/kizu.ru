# Conditions for CSS Variables

I'll start from this: [there are no](*not-those "There is a module named “[CSS Conditional Rules](https://www.w3.org/TR/css3-conditional/)”, but don't expect it to cover the CSS variables — it covers some at-rules stuff. There is even a [proposal](https://tabatkins.github.io/specs/css-when-else/) for `@when`/`@else` at-rules, which, again, do not anything in common with variables.") conditions in specs to use with [CSS variables](https://www.w3.org/TR/css-variables-1/). I think that this is a really big flaw in the spec, as while variables already provide a lot of things that were not possible in any other way before, the absence of conditions is really frustrating, as there could be a lot of uses for them.

But what if we need those imaginary conditional statements for our CSS variables _now_? Well, as with a lot of other CSS stuff, we can hack our way around to achieve the same result.


## The Problem's Definition

So, what we need is a way to use a single CSS variable for setting different CSS properties to _different_ values, but not based directly on this variable (that is — those values shouldn't be _calculated_ from our variable). We need **conditions**.


## Using Calculations for Binary Conditions

Long story short, I'll just present the solution to you right now and will explain it later:

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

In this example, we're making all of our elements with class `.block` have a padding of `10px` and a border width of `1px` unless the `--is-big` is set to `1`, in which case they would become `25px` and `3px` respectively.

The mechanism behind this is rather simple: we use both our possible values in a single calculation using `calc()`, where we nullify one and keep another value based on the variable's value which can be either `1` or `0`. In other words, we'll have `25px * 1 + 10px * 0` in one case and `25px * 0 + 10px * 1` in another.


## More Complex Conditions

We can use this method to choose not only from 2 possible values but for choosing from 3 or more values. However, for each new added possible value the calculation becomes more complex. For choosing between 3 possible values it would already look like this:

    .block {
        padding: calc(
            100px * (1 - var(--foo)) * (2 - var(--foo)) * 0.5 +
             20px * var(--foo) * (2 - var(--foo)) +
              3px * var(--foo) * (1 - var(--foo)) * -0.5
        );
    }

    {:.language-css}

This could accept `0`, `1` and `2` values for `--foo` variable and calculate the padding to `100px`, `20px` or `3px` respectively.

The principle is the same: we just need to make each possible value an expression that would be equal to `1` when the condition for this value is the one we need and to `0` in other cases. And this expression can be composed rather easily: we just need to nullify each other possible value of our conditional variable. After doing this we'd need to add our triggering value there to see if we'd need to adjust the result so it would be equal to 1. And that's it.


### A Possible Trap in the Specs

With the increasing complexity of such calculations, there is a chance at one point they would stop working. Why? There is this note in [specs](https://drafts.csswg.org/css-values-3/#calc-syntax):

> UAs must support calc() expressions of at least 20 terms, where each NUMBER, DIMENSION, or PERCENTAGE is a term. If a calc() expression contains more than the supported number of terms, it must be treated as if it were invalid.

Of course, I tested this a bit and couldn't find any such limitation in the browsers I tested, but there is still a chance that either you write some really complex code that would meet the possible existing limit, or some of the browsers could introduce this limit in the future, so be careful when using really complex calculations.


## Conditions for Colors

As you can see, those calculations could be used only for things that you can _calculate_, so there is no chance we could use it for switching the values of `display` property or any other non-numeric ones. But what about colors? Actually, we can calculate the individual components of the colors. Sadly, right now it would work only in Webkits and Blinks, as [Firefox don't yet support](https://bugzilla.mozilla.org/show_bug.cgi?id=984021 "Bugzilla ticket") `calc()` inside `rgba()` and other color functions.

But when support is finally there (or if you'd like to experiment on this in browsers that already support it), we could do things like this:

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

Here we'd have lime color by default and red if the `--is-red` is set to `1` (note that some parts of the expression will always be zero, and could be omitted, making the code more compact, but here I kept them in for clarity of the algorithm).

Likewise, as you can use a calculation with any part, it is possible to create these conditions for any colors (and maybe even for gradients? You should try it!).


### Another Trap in the Specs

When I was testing how the conditions work for colors, I found out a really, _really_ [weird limitation in Specs](*issue-resolved "Tab Atkins [commented](https://github.com/kizu/kizu.github.com/issues/186) that this issue with color components was fixed in the specs (but is not yet supported by browsers). Yay! Also they said that as another solution we could just use percentages inside `rgba`, I totally forgot about this feature, haha."). It is called [“Type Checking”](https://twitter.com/kizmarh/status/788504161864261632). I now officially hate it. What this means is that if the property accepts only `<integer>` as a value, if you'd have any divisions or non-integers inside the `calc()` for it, even if the result would be integer, the “resolved type” wouldn't be `<integer>`, it would be `<number>`, and that means that those properties won't accept such values. And when we'd have calculations involving more than two possible values, we'd need to have non-integer modifiers. And that would make our calculation invalid for colors or other integer-only properties (like `z-index`).

For example:

    calc(255 * (1 - var(--bar)) * (var(--bar) - 2) * -0.5)
    {:.language-css}

Would be invalid when inside of the `rgba()`. Initially I thought that this behaviour was a bug, especially knowing how the color functions can actually accept the values that go beyond the possible ranges (you can do `rgba(9001, +9001, -9001, 42)` and get a valid yellow color), but this typing thing seems to be too hard for browsers to handle.

#### Solutions?

There is one far from perfect solution. As in our case we know both the desired value and the problematic modifier, we can pre-calculate them and then round it up. Yes, that does mean that the resulting value could be slightly different, as we would lose some precision due to rounding. But it is better than nothing, right?

However, there is another solution that would work for colors — we can use `hsla` instead of `rgba`, as it accepts not integers, but numbers and percentages, so there won't be a conflict in type resolving. But for other properties like `z-index` this solution won't work. But even with this method there could still be some losses in precision if you're going to convert `rgb` to `hsl`. But those should be less than in the previous solution.


## Preprocessing

When the conditions are binary it is still possible to write them by hand. But when we're starting to use more complex conditions, or when we're getting to the colors, we'd better have tools that make it easier to write. Luckily, we have preprocessors for this purpose.

Here is how I managed to do it quickly in [Stylus](*pen "You can look at [CodePen with this code](http://codepen.io/kizu/pen/zKmyvG) in action."):

    conditional($var, $values...)
      $result = ''

      // If there is only an array passed, use its contents
      if length($values) == 1
        $values = $values[0]

      // Validating the values and check if we need to do anything at all
      $type = null
      $equal = true

      for $value, $i in $values
        if $i > 0 and $value != $values[0]
          $equal = false

        $value_type = typeof($value)
        $type = $type || $value_type
        if !($type == 'unit' or $type == 'rgba')
          error('Conditional function can accept only numbers or colors')

        if $type != $value_type
          error('Conditional function can accept only same type values')

      // If all the values are equal, just return one of them
      if $equal
        return $values[0]

      // Handling numbers
      if $type == 'unit'
        $result = 'calc('
        $i_count = 0
        for $value, $i in $values
          $multiplier = ''
          $modifier = 1
          $j_count = 0
          for $j in 0..(length($values) - 1)
            if $j != $i
              $j_count = $j_count + 1
              // We could use just the general multiplier,
              // but for 0 and 1 we can simplify it a bit.
              if $j == 0
                $modifier = $modifier * $i
                $multiplier = $multiplier + $var
              else if $j == 1
                $modifier = $modifier * ($j - $i)
                $multiplier = $multiplier + '(1 - ' + $var + ')'
              else
                $modifier = $modifier * ($i - $j)
                $multiplier = $multiplier + '(' + $var + ' - ' + $j + ')'

              if $j_count < length($values) - 1
                $multiplier = $multiplier + ' * '

          // If value is zero, just don't add it there lol
          if $value != 0
            if $modifier != 1
              $multiplier = $multiplier + ' * ' + (1 / $modifier)
            $result = $result + ($i_count > 0 ? ' + ' : '') + $value + ' * ' + $multiplier
            $i_count = $i_count + 1

        $result = $result + ')'

      // Handling colors
      if $type == 'rgba'
        $hues = ()
        $saturations = ()
        $lightnesses = ()
        $alphas = ()

        for $value in $values
          push($hues, unit(hue($value), ''))
          push($saturations, saturation($value))
          push($lightnesses, lightness($value))
          push($alphas, alpha($value))

        $result = 'hsla(' + conditional($var, $hues) + ', ' + conditional($var, $saturations) + ', ' + conditional($var, $lightnesses) + ', ' + conditional($var, $alphas) +  ')'

      return unquote($result)
    {:.language-styl}

Yes, there is a lot of code, but this mixin can generate conditionals for both numbers and colors, and not only for two possible conditions but for many more.

The usage is really easy:

    border-width: conditional(var(--foo), 10px, 20px)
    {:.language-styl}

The first argument is our variable, the second one is the value that should be applied when the variable would be equal to `0`, the third — when it would be equal to `1`, etc.

The above code would generate the proper conditional:

    border-width: calc(10px * (1 - var(--foo)) + 20px * var(--foo));
    {:.language-css}

And here is a more complex example for the color conditionals:

    color: conditional(var(--bar), red, lime, rebeccapurple, orange)
    {:.language-styl}

Which would generate something that you surely wouldn't want to write by hand:

    color: hsla(calc(120 * var(--bar) * (var(--bar) - 2) * (var(--bar) - 3) * 0.5 + 270 * var(--bar) * (1 - var(--bar)) * (var(--bar) - 3) * 0.5 + 38.82352941176471 * var(--bar) * (1 - var(--bar)) * (var(--bar) - 2) * -0.16666666666666666), calc(100% * (1 - var(--bar)) * (var(--bar) - 2) * (var(--bar) - 3) * 0.16666666666666666 + 100% * var(--bar) * (var(--bar) - 2) * (var(--bar) - 3) * 0.5 + 49.99999999999999% * var(--bar) * (1 - var(--bar)) * (var(--bar) - 3) * 0.5 + 100% * var(--bar) * (1 - var(--bar)) * (var(--bar) - 2) * -0.16666666666666666), calc(50% * (1 - var(--bar)) * (var(--bar) - 2) * (var(--bar) - 3) * 0.16666666666666666 + 50% * var(--bar) * (var(--bar) - 2) * (var(--bar) - 3) * 0.5 + 40% * var(--bar) * (1 - var(--bar)) * (var(--bar) - 3) * 0.5 + 50% * var(--bar) * (1 - var(--bar)) * (var(--bar) - 2) * -0.16666666666666666), 1);
    {:.language-css}

Note that there is no detection of `<integer>`-accepting properties, so that won't work for `z-index` and such, but it already converts colors to `hsla()` to make them manageble (though even this could be enhanced so this conversion would happen only when it would be needed). Another thing I didn't implement in this mixin (yet?) is the ability to use CSS variables for the values. This would be possible for non-integer numbers as those values would be inserted as is in the conditional calculations. Maybe, when I find time, I'll fix the mixin to accept not only numbers or colors but also variables. For the time being it is still possible to accomplish using the algorithm explained above.


## Fallbacks

Of course, if you're planning to actually use this in production, you'll need to have a way to set fallbacks. They're easy for browsers that don't support variables at all: you just declare the fallback value before the conditional declaration:

    .block {
        padding: 100px; /* fallback */
        padding: calc(
            100px * ((1 - var(--foo)) * (2 - var(--foo)) / 2) +
             20px * (var(--foo) * (2 - var(--foo))) +
              3px * (var(--foo) * (1 - var(--foo)) / -2)
        );
    }

    {:.language-css}


But when it comes to colors: we have a problem when there is a support for variables, in fact (and that's another really weird place in specs), _just any_ declaration containing variables would be considered valid. And this means that it is not possible in CSS to make a fallback for something containing variables:

    background: blue;
    background: I 💩 CSS VAR(--I)ABLES;
    {:.language-css}

The above code is valid CSS and per the spec, the background would get an `initial` value, not the one provided in a fallback (even though it is obvious that the other parts of the value are incorrect).

So, what we need in order to provide a fallback for these cases is to add a `@support` wrapper that would test the support for everything **except** for the variables.

In our case, we need to wrap our conditional colors for Firefox in something like this:

    .block {
        color: #f00;
    }
    @supports (color: rgb(0, calc(0), 0)) {
        .block {
            color: rgba(calc(255 * (1 - var(--foo))), calc(255 * var(--foo)), 0, 1);
      }
    }
    {:.language-css}

Here we're testing support for calculations inside color functions and applying the conditional color only in that case.

It is also possible to create such fallbacks automatically, but I wouldn't recommend that you use preprocessors for them as the complexity of creating such stuff is much more than the capabilities preprocessors provide.


## Use Cases

I really don't like to provide use cases for things for which the need is obvious. So I'll be brief. And I'll state not only the conditions for variables, but also the general conditions, like for the result of `calc()`.

- The conditions for CSS variables would be perfect for themifying blocks. This way you could have a number of numbered themes and then apply them to blocks (and nested ones!) using just one CSS variable like `--block-variant: 1`. This is not something that is possible through any other means other than variables and when you'd want to have different values for different props in different themes, without the conditionals you'd need to have many different variables and apply all of them in every case.

- Typography. If it was possible to use the `<`, `<=`, `>` and `>=` in conditions for variables, it would be possible to have a number of “rules” for different font sizes, so you could set different line heights, font weights and other properties based on the given font-size. This is possible now, but not when you need to have some “stops” for those values and not just the values derived from `em`s.

- Responsive design. Well, if there were the conditions for calculations, then it would be almost the same as those elusive “element queries” — you could check the `vw` or the parent's width in percentages and decide what to apply in different cases.

There could be other use cases, tell me if you find one! I'm sure I had more of them myself, but I don't have that good of a memory to remember all the things I ever wanted to do with CSS. Because it's all the things.


## Future

I would really like to see conditionals described in CSS specs, so we would not have to rely on calc hacks and could use proper conditionals for non-calculatable values too. It is also impossible right now to have conditions other than strict equality, so no “when the variable is more than X” and other stuff like that. I don't see any reasons why we can't have proper conditionals in CSS, so if you know a fellow spec developer, give them a hint about this issue. My only hope is that they won't tell us to “just use JS” or find any excuses of why that wouldn't ever be possible. Here, it is already possible now using the hacks, there can't be any excuses.
