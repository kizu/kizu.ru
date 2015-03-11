# New Stylus Features

Not so long ago I [became a maintainer](*maintaining "I'll write someday later how this happened and what exactly I do there, but it worth to mention that I'm _a maintainer_, but the main _developer_ now is my colleague [Mikhail Korepanov](gh:panya)") for [Stylus](gh:LearnBoost/stylus) CSS preprocessor.

At the end of the last week we released a new version — [0.41.0](https://github.com/LearnBoost/stylus/blob/master/History.md#0410--2013-11-30) — where we added some new features. And in the two earlier releases we added support for the hashes and polished it, so after all this work it is now possible to do a lot of interesting new things. In this article I'll explain one [new tech](*example-sidenote "you can go straight to [its step-by-step explanation](#example), or to the [resulting code](#result)") that is now possible in the new Stylus, but I'll describe the new features for a start.

## Block mixins {#block-mixins}

Finally! The thing that was missing from Stylus for so long — the ability to pass blocks of Stylus code into mixins and then use those blocks inside the mixins' bodies.

The syntax for passing the block is rather simple: we call a mixin using a `+` prefix, then we pass the block either in the curly braces, or using a new indent level (as you could do with a lot of things in Stylus):

    +foo()
      // The block we want to pass
      width: 10px
      height: 10px
{:.language-styl}


After we passed the block to the mixin, this block becomes available inside of it as a named argument — `block`. You can then use it anywhere inside the mixin using [an interpolation](*block-call "there is a possibility we would add a way of using it without interpolation in the future though"):

    foo()
      width: 20px
      .foo
        {block}
{:.language-styl}

Or we could pass this as a variable to the next mixin, or use it in any other way.

Anyway, if you've called a mixin above like this:

    .bar
      +foo()
        padding: 0
        .baz
          height: 20px    
{:.language-styl}

You would get this:

    .bar {
      width: 20px;
    }
    .bar .foo {
      padding: 0;
    }
    .bar .foo .baz {
      height: 20px;
    }
{:.language-css}

With block mixins we have a way of wrapping blocks with mixins and then wrapping them with anything. This feature is often used for handling media-queries, and my example that you'll see later in this article is also from the rwd area.

## Hashes {#hashes}

As I already mentioned, in the latest releases of Stylus we added (and polished to a usable state) hashes as a data type. Hashes are objects with key-value pairs, they look rather simple:

    foo = {
      bar: 10px,
      raz: #fff,
      baz: {
        blah: blah
        '10%': yeah
      }
    }
{:.language-javascript}

As you can see from this example, the syntax is similar to the objects in JavaScript: the key could be either an indent or a string, and anything could go into value, even nested hashes. An important part: while you can use ordinary blocks with or without curly braces in Stylus, they are mandatory for hashes, while the trailing commas [are not](*codestyle "And as with all other optional syntax features of Stylus, you should use a consistent codestyle in your stylesheets, otherwise your code would be messy as hell").

Then, after you defined a hash, you could add new properties to it or redefine old ones using dots or square brackets:

    foo.bar = 20px
    foo['whatever'] = 'hello'
{:.language-styl}

The differences are simple: while you could use only idents with the dot syntax, with square brackets you could pass any string containing any symbols, or use a variable instead. So, the brackets are more flexible, while the dot is not.

You can get the values from the hash in the same way — either by using a dot or using the square brackets.

I won't describe [all the features](http://learnboost.github.io/stylus/docs/hashes.html) of the hashes, I'll just mention that you can use the built-in `length()` function with them, you can iterate through them, use them in conditions (`if baz in foo`), and there are also some built-in functions to work with hashes (`keys()`, `values()`, `merge()`). And you can interpolate hashes into CSS.

## `selector()` function {#selector}

There is now one small but important feature in Stylus — `selector()`. While you can construct complex selectors in Stylus by using nested blocks, interpolations, mixins and other things, you couldn't _get_ the compiled selector, they only existed in the compiled CSS.

But now, using `selector()` function that returns the current compiled selector, you could do a lot of useful things, like check the selector for something using the `match()` function, or use it for something else. It is already very useful, and it would become even more so in future releases.

As an example, you can take this small chunk of code:

    if match(':(before|after)', selector())
      content: ''
{:.language-styl}

Here we check if the selector has any pseudo-elements in it and if so — we apply the `content`. This could be useful if we have some mixin, containing styles that could be applied both to a normal element and to a pseudo one.

## Example with cached media-queries {#example}

As a usage example of the new Stylus features, I'll give you a solution for one of those small responsive web design problems: the code you need to write for different viewport breakpoints. The problem is that the syntax of media-queries could be rather long, so you could either use bubbling media-queries which would result in not ideal CSS, or, in the race for bytes, you'll need to write all the overrides in one place, and that won't be very comfortable in a lot of situations.

However, in the new Stylus, with block mixins, hashes and the `selector()` function, you could work around this problem (and solve some others on your way to it).

Briefly — we can create a mixin that could be used instead of media-queries and would cache the given blocks, combining them by conditions, so you could then output all of them using a second function.

The only downside of this method is the grouping itself — the selectors would be in a different order, so the specificity of the selectors could change.

For the start we need an object where we would store the cached blocks:

    $media_cache = {}
{:.language-styl}

Then we would need a mixin which we could use instead of media-queries, its basic form would be this:

    media($condition)
      unless $media_cache[$condition]
        $media_cache[$condition] = ()
      push($media_cache[$condition], block)
{:.language-styl}

This mixin's logic is rather simple: if we don't have a list for the blocks for a given condition, we initialize it then we pass the block to this list.

It won't be enough for us actually: this mixin could be used only this way:

    +media('(max-width:640px)')
      .foo
        display: block;
{:.language-styl}

We could only pass full blocks to it, but couldn't use the bubbling:

    .foo
      +media('(max-width:640px)')
        display: block;
{:.language-styl}

The code of our `media` mixin doesn't know anything about the context, the selector where we called it — yet. Here the new `selector()` function and an extra helper mixin are required, and with them `media` mixin would look like this:

    media($condition)
      helper($condition)
        unless $media_cache[$condition]
          $media_cache[$condition] = ()
        push($media_cache[$condition], block)
        
      +helper($condition)
        {selector()}
          {block}
{:.language-styl}

To save the context we move the initial code of this mixin inside a helper mixin, then call it passing the `block` inside the interpolated` selector()`.

So, as we now wrap the code with a mixin, it won't build automatically. We would need to call a function that would take a cache and put all it contains where we call it (and it would be logical to call it at the end of our stylesheet):

    apply_media_cache()
      for $media, $blocks in $media_cache
        @media $media
          for $block in $blocks
            {$block}
{:.language-styl}

It is rather easy: we iterate through the cache, taking the condition — `$media`, and the list of all the blocks that were called with it — `$blocks`, then we create the media-query with that condition and inside of it iterate through all the blocks, yielding all of them one by one.

So, if we would then call this function at the end of the document:

    apply_media_cache()
{:.language-styl}

We would get what we want.

However, there are a few things to improve in this function: we do not want to always write the parentheses, and, actually, we won't want to write all those `only screen and`. Also, we would want to use some keywords instead of the literal conditions, like [`palm`, `portable`, `desk`](*keywords "I've taken the names from the great [inuit.css](http://inuitcss.com/) framework by [Harry Roberts](@csswizardry)") and so on. With those improvements and all the previous steps the resulting code would be this:

### Resulting code {#result}

    // Define the cache and the aliases
    $media_cache = {}
    $media_aliases = {
      palm:       '(max-width: 480px)'
      lap:        '(min-width: 481px) and (max-width: 1023px)'
      lap-and-up: '(min-width: 481px)'
      portable:   '(max-width: 1023px)'
      desk:       '(min-width: 1024px)'
      desk-wide:  '(min-width: 1200px)'
    }

    // Mixin for caching the blocks with the given conditions
    media($condition)
      helper($condition)
        unless $media_cache[$condition]
          $media_cache[$condition] = ()
        push($media_cache[$condition], block)

      +helper($condition)
        {selector() + ''}
          {block}

    // Function we would use to call all the cached styles
    apply_media_cache()
      for $media, $blocks in $media_cache
        $media = unquote($media_aliases[$media] || $media)
        $media = '(%s)' % $media unless match('\(', $media)
        $media = 'only screen and %s' % $media
        @media $media
          for $block in $blocks
            {$block}

    // Here would be our main styles, using the `media` mixin
    // …

    // Here we call all the cached styles
    apply_media_cache()
{:.language-styl}

Then we could write our stylesheets like this:

    .foo
      width: 10px

      +media('lap')
        width: 20px

      +media('desk')
        width: 30px

      +media('min-width: 200px')
        width: 60px

    .bar
      height: 10px

      +media('lap')
        height: 20px

      +media('desk')
        height: 30px

      +media('min-width: 200px')
        height: 50px

      +media('(min-width: 500px) and (max-width: 700px)')
        height: 50px
{:.language-styl}

And get this result afterwards:

    .foo {
      width: 10px;
    }
    .bar {
      height: 10px;
    }
    @media only screen and (min-width: 481px) and (max-width: 1023px) {
      .foo {
        width: 20px;
      }
      .bar {
        height: 20px;
      }
    }
    @media only screen and (min-width: 1024px) {
      .foo {
        width: 30px;
      }
      .bar {
        height: 30px;
      }
    }
    @media only screen and (min-width: 200px) {
      .foo {
        width: 60px;
      }
      .bar {
        height: 50px;
      }
    }
    @media only screen and (min-width: 500px) and (max-width: 700px) {
      .bar {
        height: 50px;
      }
    }
{:.language-css}

In the resulting code we can see that we added the hash with aliases, we can also call the mixin with conditions lacking parentheses.

By using this code we can now use media-queries bubbling anywhere we want and don't even need to think about the extra bytes — everything would be nciely grouped inside non-doubling media-queries. All thanks to the new Stylus features.

Of course, this code is not ideal, and there could be a lot of ways to improve it, but my goal was to demonstrate the new features and how they work, after all.