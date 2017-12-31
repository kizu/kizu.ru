# Inline CSS Variables

Also known as “custom properties”, CSS variables are really, really [powerful](*available "And they're already [available in most browsers](https://caniuse.com/#feat=css-variables), so I'd say that at the end of this year we could totally see them appear in production more and more."). They're not the same thing as variables in preprocessors: they're dynamic and most of the usual rules that apply for CSS properties also apply to them. Inheritance, usage inside dynamic `calc()` and so on. One of those rules: we can use CSS variables inside HTML's `style` attribute.

You may say: “but aren't inline styles bad?” — and if we would talk about our good old CSS properties that would be true — they're far from being effective, and are really bad for specificity. But custom properties? That's a whole different world. And while in my research of CSS variables I found a lot of interesting stuff about them overall, in today's article I'll focus on this one part — when they're used right in the `style` attribute of your HTML.

## Specificity

Whenever we use regular CSS properties in our inline styles, the only way to override them is to use `!important` in CSS. And if we'd look at our custom properties — this stays the same. But not exactly. There are two main differences:

1. All the custom properties are inherited to all the children by default. That means that if we're not using the value of this variable right on the element, where it would be defined in inline styles, we could override this variable on children using just anything we'd want, as specificity is not inherited.




2. CSS variables are just tools to get some values to our regular CSS properties. And, again, specificity of a variable won't matter for the specificity of the property. If the property itself is not inline, we could override it really easily in CSS.




- - -

- - -

- - -

- - -

- - -




















I'm just starting to play with [CSS grids](https://www.w3.org/TR/css-grid-1/), but I'm already in love. However, I'm playing not just with them: there is a technique I wanted to talk about that uses [CSS variables](https://www.w3.org/TR/css-variables-1/), and as grids and variables have [very similar](*similar "Can I use: [grids](https://caniuse.com/#feat=css-grid) and [vars](https://caniuse.com/#feat=css-variables).") browser support, it makes sense to try them together.

## Powers of Grids

I won't talk much about how great CSS grids themselves are: [Rachel Andrew](https://rachelandrew.co.uk/) and [Jen Simmons](http://jensimmons.com/) had already done a tremendous amount of work to show the nuances of this new specification (go read their articles about the grids if you didn't yet).

But there is one thing that can be seen in most examples: we can apply most of the things from the grids in really compact ways, achieving awesome results using just really simple declarations. Where in the past you would need a lot of complex CSS for a grid layout and placement for each element, with grids you now need just one or two very simple declarations. And sometimes those short declarations look really similar to the syntax a lot of grid systems tried to achieve in their class names.

Of course, it wouldn't make sense to create class names like `grid--span-2`. But then, what if you'd want to apply things like this through inline CSS at HTML level? This way it would be really easy to prototype your layouts and/or provide a rather readable way to understand and maintain your layout.

We all know all the problems that come with inline styles: the specificity issue, the absence of media queries… But what if we could somehow solve those issues?

## Inline CSS Variables

Also known as “custom properties”, CSS variables are also really, really powerful. They're not the same thing as variables in preprocessors, as they're dynamic and most of the usual rules that apply for CSS properties also apply to them. One of those rules: we can [use](*use "You can skip to [the final working snippet](#universal-inline-variables) if you don't want to read how I get there.") CSS variables inside HTML's `style` attribute.

To better understand why we are talking about CSS variables look at this:

    --background: red;
    background: var(--background);
    {:.language-css}

In this snippet we're using the custom `--background` property as a _proxy_ for our main property. In usual CSS that won't make much sense, but what if we'd use `--background` in inline styles?

    <h1 style="--background: red;">Hello</h1>
    {:.language-html}

<!-- -->

    h1 { background: var(--background); }
    {:.language-css}

Now, think about this: what if we'd want to add some different styles for our header in CSS?

    h1:hover { background: lime; }
    {:.language-css}

Aha! There it is: if we did use the usual property inside the `style` attribute, it would always be more specific than anything that we'd write in our CSS unless we would add `!important` due to how cascade works. But when we use a CSS variable, only the variable itself would be that high in the cascade! While the `background` property would have a specificity of just one HTML element and whenever we'd write something that would override it, this property would lose the connection to the variable. That makes our life so much easier, as we're freeing the specificity and could work with our CSS without bloating it with unnecessary overrides.

But that's not the only thing that we're getting from variables, look at this:

    h1:hover { background: var(--background--hover); }

    @media (max-width: 640px) {
      h1 { background: var(--background--compact); }
    }
    {:.language-css}

Guess what would happen when we would declare `--background-hover` and/or `--background--compact` as an inline style?

We would get a way to set up the styles to the states right in our HTML.

Here is a full example, which also uses the fallbacks for our variables as unset variable would make the property to render with an initial value:

    h1 { background: var(--background); }

    h1:hover {
      background: var(--background--hover, var(--background));
    }

    @media (max-width: 640px) {
      h1 {
        background:
          var(--background--compact, var(--background));
      }
    }
    {:.language-css}

**TODO: don't like the flow there ↓**

While there are not [a lot of cases](*inline-cases "We can use this method as a way to provide those with an access for our HTML as a kind of API for the things that are not possible inside plain style attribute. Things like CMS, email clients, or generated HTML could really welcome such things.") where things like that can be used, grids are one of those.

### Universal Inline Variables

And if you'd want to use such properties for everything, for example, to provide a certain hover hook, but without relying on having an always set fallback? There is [a way](*warning "Try not to use a space combinator with those selectors ever though, as while on their own such selectors are ok, selectors like `.foo [style]` can be bad for performance.")!

    [style*='--background--hover:']:hover {
      background: var(--background--hover);
    }
    {:.language-css}

This way we won't need a fallback for when there is no `--background--hover` on an element, as in that case this rule won't ever apply. Also, if you'd keep all your custom inline properties under such selectors, it would be much easier to handle how they would be applied. The only issue is that this would make the selector to have much more specificity than just the `*` one, but still manageable.

Another nice feature of such way of declaring inline variables is that we don't need to reset them to `initial` on each other element to prevent the inheritance (unless we'd like to use them outside of the inline styles, which I won't recommend, as in CSS it would be better to just use appropriate CSS properties directly).

## Variables Into Grids

So, how does all of this click with the grids? It allows us to use most of the grid properties in an inline way. Grid has a lot of them, and if we'd like to declare those inline variables for each of them it could seem to be a bit excessive, but the best thing is that we still need only one declaration with just one selector for each of those cases, the code for them is rather readable, and its possible to control how they would apply using CSS' cascade and specificity rules.

### Order Matters

The important part is that when we'd want to use multiple connected properties, the order would matter. When we have a single variable [defined](*naming "I prefer to omit the `grid-` part and make those variables easier to use, but if you'd want to write your own inline variables system, you could want to think on adding some kind of prefix for them."):

    [style*='--column:'] {
      grid-column: var(--column);
    }
    {:.language-css}

Everything is straightforward. But as the `grid-column` property is a shorthand for `grid-column-start` and `grid-column-end`, we could also want to add those as inline variables. In that case if we'd place the declarations for them before the declaration for shorthand, then if for some reason you would have both of those declared for one element, the shorthand would win. In my opinion, its better to always define the shorthands first, and then continue with other properties as that would allow for more gradual control.

### Not Just Properties

While its possible to declare 1:1 mappings for properties, in a lot of cases we can actually make our own subproperties this way!

For example, a common pattern for grid frameworks is to provide a way to _span_ an item to a certain number of columns. While that is possible through `grid-column-start` or `grid-column-end`, we could want to have a way to do it easier:

    [style*='--span:'] {
      grid-column-end: span var(--span);
    }
    {:.language-css}

And in case we'd want to use both `--column-end` and `--span`, we can [manually handle this](*initials "Its possible to handle this in another way, by reusing the variables inside the more specific definitions of other definitions, but then we'd need to handle the inheritance problem and I found out this to be worse than having explicit definitions of combinations."):

    [style*='--column-end:'][style*='--span:'] {
      grid-column-start: span var(--span);
      grid-column-end: span var(--column-end);
    }
    {:.language-css}

The only problem is the increased specificity: if we'd want to have `--column-start` as well and override the `--span` when the `--column-end` is also present, we'd need to handle this. But that is still possible, and we'd be in control over how we could do this.

Another example: imagine having an inline `grid-template-columns`:

    [style*='--template-columns:'] {
      grid-template-columns: var(--template-columns);
    }
    {:.language-css}

If you're creating a grid system where you'd want to have multiple grids with a different number of equal columns, we can make this so much easier by adding a custom inline property like this:

    [style*='--columns:'] {
      grid-template-columns: repeat(var(--columns), 1fr);
    }
    {:.language-css}

Then, when we'd use it:

    <div class="grid" style="--columns:12">
    {:.language-css}

We would get our grid with 12 columns.

Overall, its really interesting to look at ways we can make our own shortcuts like that, and this can be used not only for inline variables, of course.

### Reusing Variables: Nested Grids

While in most cases those inline variables should be used just by themselves, its possible to create interesting interactions using the fact that we can reuse them for other purposes.

Imagine having a grid that have some items that are stretched using the `--span` defined above. What if we would want to make a subgrid at this item, but in a way we could still somehow use the above declared columns? We can always add new `--columns` equal to the `--span`, but we don't need to do this as we can handle this much easier and in an automatic way. And all we would need to do is to set our columns whenever we set our `--span`:

    [style*='--span:'] {
      grid-template-columns: repeat(var(--span), 1fr);
      grid-column-end: span var(--span);
    }
    {:.language-css}

By doing this and placing this before our declaration of `--columns`, we would make all our subgrids to have their columns to be equal to the number of parent columns our subgrid spans to, and we won't lose a way to redefine the number of columns if we'd want to.

## Responsiveness and Control

Other than an ability to create our custom subproperties, there are other nice things our inline variables are able to achieve. For example, responsiveness.

If we'd want, we could easily redefine any of our styles in any conditions as we don't need to use `!important` for our overrides and can just use normal specificity rules. But that's not that interesting. If we would look at a lot of old grid frameworks, we would see how they use different sets of classnames to achieve a way to declare how the grid content should span in different conditions. With inline variables its also possible (unlike usual inline styles): we can just [declare](*bem-mod "I'm using the BEM syntax for those modifiers, but you could come up with any other naming solutions for this purpose, of course.") another set of variables that we would use at our new conditions:

    @media (max-width: 640px) {
      [style*='--columns--compact:'] {
        grid-template-columns: repeat(var(--columns--compact), 1fr);
      }
    }
    {:.language-css}

This way we could use `--columns-compact` as an inline variable that would set the columns count only at

## The End

Do I think that this method for using inline styles is the best for the grids? No, far from it. But in my opinion its better than either simple inline styles (which are hard to override and not responsive) or class/nth-child-based solutions (as they're cumbersome and can be sometimes harder to maintain). If you need to have a precise control over your grids, I think you could try it. But you should also look at all the other possibilities grids provide and play with them in a way you wouldn't need the grid systems at all?

Anyway, I hope you did learn at least something new from this article even if the idea itself is not something you would use as is.