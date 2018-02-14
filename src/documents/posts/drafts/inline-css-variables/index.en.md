# Inline CSS Variables

Also known as “custom properties”, CSS variables are really, really [powerful](*available "And they're already [available in most browsers](https://caniuse.com/#feat=css-variables), so I'd say that at the end of this year we could totally see them appear in production more and more."). They're not the same thing as variables in preprocessors: they're dynamic and most of the usual rules that apply for CSS properties also apply to them. Inheritance, usage inside dynamic `calc()` and so on. One of those rules: we can use CSS variables inside HTML's `style` attribute.

You may say: “but aren't inline styles bad?” — and if we would talk about our good old CSS properties that would be true — they're far from being effective, and are really bad for specificity. But custom properties? That's a whole different world. And while in my research of CSS variables I found a lot of interesting stuff about them overall, in today's article I'll focus on this one part — when they're used right in the `style` attribute of your HTML.

## Specificity

Whenever we use regular CSS properties in our inline styles, the only way to override them is to use `!important` in CSS. And if we'd look at our custom properties — this stays the same. But [not exactly](*skip-specificity "This is rather basic part, if you already know CSS variables pretty well, feel free to [skip to use cases](#use-cases)."). There are two main differences.

### Inheritance

All the custom properties are inherited to all the children by default. That means that if we're not using the value of this variable right on the element, where it would be defined in inline styles, we could override this variable on children using just anything we'd want, as specificity is not inherited.

[partial:children]

Here is a CSS & HTML for this example:

    .parent {
      border: 1px solid;
      padding: 5px;
    }
    .child {
      padding: 5px;
      --background: pink;
      background: var(--background);
    }
    {:.language-css}

<!-- -->

    <div class="parent" style='--background: red'>
      <div class="child">I has pink bg, obviously.</div>
    </div>
    {:.language-html}

This is really simple thing, but its sometimes easy to forget that CSS variables are not rendered to anything until you use them.

### Appliance

Another thing not to forget — CSS variables are just tools to get some values to our regular CSS properties. And, again, specificity of a variable won't matter for the specificity of the property. If the property itself is not inline, we could override it really easily in CSS.

[partial:appliance]

Again, very simple HTML & CSS:

    .foo {
      background: var(--background);
    }
    .bar {
      background: pink;
    }
    {:.language-css}

<!-- -->

    <div class="foo bar" style='--background: red'>
      I has pink bg again, obviously.
    </div>
    {:.language-html}

Here the specificity of `background` inside `.foo` isn't attached in any way to the specificity of the variable it uses, so when we'd override it later with another `background`, we won't need to think about specificity.

### Fallbacks

Another method that we could use if we can control the initial usage of variable in CSS not to deal with specificity — variable's fallback values. If we know that some of the variables could become really hard to override, we can create those override hatches manually:

[partial:fallbacks]

Its CSS & HTML:

    .foo {
      background: var(--background-override, var(--background));
    }
    .bar {
      --background-override: pink;
    }
    {:.language-css}

<!-- -->

    <div class="foo bar" style='--background: red'>
      And once more: pink background.
    </div>
    {:.language-html}

If you'd go into dev tools and would disable the `bar` class, you'll see how the `--bg` variable would become used. This is a helpful method which we could use for providing multiple ways of getting our values to CSS properties later.

So, no, we don't have problems with specificity, as we can design our code in a way it won't matter.

## Use Cases

Now that we're a bit more calmer about inline styles and CSS variables inside them, what are exactly use cases? Why would we need inline styles in the first place?

Talking in general, I can think of three main areas for inline CSS variables:

1. API connecting CSS with JS.
2. Replacement for utility classes.
3. Providing our CSS with “data” which we could use later.

The first one can be often used when we'd want to move our presentational logic from JS to CSS, Lea Verou [gave a nice talk](https://www.youtube.com/watch?v=UQRSaG1hQ20) [about](*recommended "I recommend you to watch it anyway, as she describes there a lot of really interesting nuances of CSS variables.") CSS variables, mentioning a bunch of use cases for this part in the end of the talk.

While I'll try to cover the other usage examples there, it doesn't mean those could be used only for those — as everything in CSS, you can re-use and re-mix all the methods like you want and invent new ways of doing old stuff, or just the new stuff that becomes available with all the new methods.

## Universal Inline Variables

The first big thing I'll talk about is a general way of using inline styles, but via CSS variables. There are a lot of libraries in CSS and in JS which allow you to have silly “utility” classes like `p10` which would often be just a substitute for inline styles. They are often done in those ways using classnames because of two things: specificity I've talked above, and responsiveness — with classnames its easy to override the values for those classnames.

But with variables, its really easy to create some really flexible ways to have inline utility styles that won't be bad for specificity and could be nicely used with any responsive techniques.

Here is what I mean by a “Universal inline variable”:

    [style*='--bg:'] {
      background-color: var(--bg);
    }
    {:.language-css}

What this does:

1. It allows you to add a background-color in your inline styles.
2. Does this in a way it would always have the specificity of one class and as if placed where this definition of this variable is placed.
3. The declaration with the variable would be applied **only** when you set it using inline style, as it would match only the case of its usage there by an appropriate attribute selector.
4. The above means that there won't be any inheritance, as long as you won't use this variable anywhere else in CSS. In case you'll still want to use it and don't have inheritance, you can use this trick: `* { --bg: initial }`.

If we'd have this snippet for our `--bg` variable, and then we'll add the following CSS and HTML:

[partial:universal1]

    .baz {
      background: yellow;
    }
    {:.language-css}

<!-- -->

    <ul>
      <li>No background there.</li>
      <li style='--bg: pink'>This one is pink.</li>
      <li style='--bg: pink' class='baz'>But this one is yellow!</li>
    </ul>
    {:.language-html}

You can see how by default no background is applied, but it can be set by using a `--bg` variable, which would still be overridden by a single classname (if it would be placed after the variable definition in CSS).

On its own this example is not very interesting, but things change when we'd want to add some other styles, for example, we could want all those list items to become lime on hover by default, and give a way to override it by using inline variables:

[partial:universal2]

    [style*='--bg--hover:']:hover:hover {
      background-color: var(--bg--hover);
    }

    .hovering:hover {
      background: lime;
    }
    {:.language-css}

<!-- -->

    <ul>
      <li class='hovering'>Hover me to see the color</li>
      <li class='hovering baz' style='--bg: pink'>Now, hover me, still same color on hover.</li>
      <li class='hovering' style='--bg: pink; --bg--hover: aqua'>And I'll be aqua on hover!</li>
    </ul>
    {:.language-html}

Things to notice there:

1. Yes, this way we can add hover styles in inline styles! Any other dynamic styles are possible this way: we can just use a variable in the conditions we need.
2. The specificity of the `.hovering:hover` is always more than the specificity of the universal variable for static bg, so it would always override it.
3. We've increased the specificity of the universal variable for hover there to make it more specific than the defined selector, but even in that case we could always introduce a new more specific selector in order to override it, and still don't use `!important`.


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