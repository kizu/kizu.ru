---
mastodon_post_id: "112240652907017938"
---

# Layered Toggles: Optional CSS Mixins

#CSS_Layers #CSS_Variables #CSS_Logic #Style_Queries #Experiment #Practical #CSS

_In this article, I am sharing the next evolution of space & cyclic toggles, which allows us to create and apply optional mixins in CSS with the help of custom cascade layers, available today in every browser that supports them._

I am no stranger to looking for various ways to apply some CSS conditionally, and through the years, went from using math as a way to achieve [conditions for CSS variables](/conditions-for-css-variables/) back in 2016, to [cyclic dependency space toggles](/cyclic-toggles/) that I came up with last year.

This was one of the reasons why I found another missing piece for this puzzle of having _conditions_ in CSS, as an experiment in reply to [Heydon Pickering](https://heydonworks.com/)'s [question in Mastodon](https://front-end.social/@heydon/112234057015687360), which I could’ve potentially missed if not for [Nathan Knowler](https://knowler.dev/) [mentioning](https://sunny.garden/@knowler/112234073662211751) my cyclic toggles article.

While the technique I discovered did not help Heydon with his case, I found this discovery to be important enough to share as fast as I could. So here we are.


## The Technique

This technique, which I named “layered toggles”, essentially allows us to apply any number of CSS mixins on any element!

Let me show you a minimal example[^example], and afterward, I will explain what’s going on.

[^example]: All the examples in the article are just quick demonstrations of the technique, maybe with time I will add a few more practical ones. <!-- span="2" -->

{{<Partial src="examples/layered-toggles-1.html" />}}

```CSS
@layer default {
  .item {
    padding: 1em;
    border-radius: 0.5em;
    background: var(--PINK);
  }
}

@layer mixins {
  * {
    --hover: var(--hover--off);
    --hover--off: var(--hover,);
    --hover--on: var(--hover,);

    background-color:
      var(--hover--off, revert-layer)
      var(--hover--on, var(--GREEN));
  }
}

/* Applying mixin */
.can-be-hovered:is(:hover, :focus-visible),
.pseudo-hovered {
  --hover: var(--hover--on);
}
```

The first thing you might notice: we’re using custom [cascade layers](https://drafts.csswg.org/css-cascade-5/#layering). This is the main requirement[^requirement] for the technique to work, specifically [the `revert-layer` CSS-wide keyword](https://drafts.csswg.org/css-cascade-5/#revert-layer).

[^requirement]: Thankfully, every major desktop browser [supports cascade layers](https://caniuse.com/css-cascade-layers) from March 2022, but I will recommend against using this technique in production as something foundational and not as a progressive enhancement. <!-- span="2" offset="1" -->

I started playing with it after reading [Nathan](https://knowler.dev/)'s [“So, You Want to Encapsulate Your Styles?”](https://knowler.dev/blog/so-you-want-to-encapsulate-your-styles) article, as well as [Mayank](https://www.mayank.co/)'s [“Some use cases for revert-layer”](https://www.mayank.co/blog/revert-layer) one, specifically [“the self-reset”](https://www.mayank.co/blog/revert-layer#the-self-reset) section, but, until now, I did not think of combining layers with the space or cyclic toggles.

But, this time, I tried to use[^revert-layer-nuance] the `revert-layer` as one of the cyclic toggle’s values — and it did work!

[^revert-layer-nuance]: Something needs to be said about how we can only use CSS-wide keywords like `revert-layer` or `inherit` with CSS variables only as an immediate fallback value, but that’s probably a topic out of scope for this article. <!-- span="3" -->

So, here is what is going on:

1. We need to separate our styles into two layers: the lower one will contain the “default” styles, and the higher layer will contain our “mixins”. This allows mixins to override the default styles when they are applied.

2. In our mixins, we are using [“Cyclic Dependency Space Toggles”](/cyclic-toggles/) to define our styles, with the **important** part being `revert-layer` applied as the _default_ value. Due to how it works, this allows us to “return control” over the property to the lower layers unless our “condition” (enabling some mixin) will happen.

3. Finally, our set-up is complete, and we can “use” our mixin by switching the value of our cyclic toggle anywhere in CSS. As soon as it is enabled — based on some selector, media query, inline styles, or anything else — the mixin’s styles will override the default styles.

And here we are — with the ability to apply some styles conditionally based on a single CSS variable on any element, but without messing up our default styles.

I wanted to have this as a feature for years, probably since I first saw [Lea Verou](https://lea.verou.me/) define pseudo-mixins using the universal selector in [one of her CSS Variables](https://youtu.be/2an6-WVPuJU?si=5n7nrizmLxkEivV6&t=1825) talks. But when the styles were inside just a rule with a universal selector, that led to any later rules that touched this property to override our mixin’s styles. And if we do anything with this, our mixin could become too powerful and go over everything. Layered toggles don’t have this problem.

## Limitations

Of course, this technique is not without its limitations:

1. All mixins live in a shared space. This means: that if multiple mixins need to toggle the same CSS property, we will need to _define_ how this should be handled. In the next section, I will show two ways to do it.

2. As we’re applying our styles through a universal selector (`*`), we could use the mixin to only style the element itself, not its children. However, it will be possible to work around this with style queries, I’ll describe how later in the article. This might also be a blessing in some cases, as we don’t want to apply mixin to the _nested_ elements, so the disabled inheritance here can be welcome.

3. We cannot toggle other cyclic toggles with this. Or, at least, I did not find a way to do so yet.

4. Obviously, it requires the CSS layers to be supported, and all main styles to be handled by CSS layers. This means that you might wait to apply this technique unless you are certain that you can use custom cascade layers with the browser support your website requires.

Because this technique is so new, there is a big chance I’m missing some other limitations or potential problems — if you encounter any, please let me know, and I will include them in this article.

## Advanced Cases

### Multiple Mixins

What if we want to have two mixins, and both of them would like to apply some `background`? Which should win? How do we define this?

Thankfully, as we’re already using custom cascade layers, we can continue doing just that and rely on their cascading nature!

Nothing stops us from separating every mixin into its sub-layer, making it possible for every mixin to handle its list of properties, and revert any of its layered values to either some other previously defined mixin or to the default values on the element.

{{<Partial src="examples/layered-toggles-2-cascading.html" />}}

Here is the CSS for this example:

```CSS
@layer mixins.alpha {
  * {
    --mix-alpha: var(--mix-alpha--off);
    --mix-alpha--off: var(--mix-alpha,);
    --mix-alpha--on: var(--mix-alpha,);

    --mix-alpha-color: currentColor;
    --mix-alpha-value: 75%;

    color:
      var(--mix-alpha--off, revert-layer)
      var(--mix-alpha--on,
        color-mix(
          in srgb,
          var(--mix-alpha-color)
          var(--mix-alpha-value),
          transparent
        )
      );
  }
}

@layer mixins.red {
  * {
    --mix-red: var(--mix-red--off);
    --mix-red--off: var(--mix-red,);
    --mix-red--on: var(--mix-red,);

    background:
      var(--mix-red--off, revert-layer)
      var(--mix-red--on, var(--RED));
    color:
      var(--mix-red--off, revert-layer)
      var(--mix-red--on, #FFF);
    text-shadow:
      var(--mix-red--off, revert-layer)
      var(--mix-red--on, none);
  }
}

/* Applying mixins */
.with-alpha {
  --mix-alpha: var(--mix-alpha--on);

  &:is(:hover, :focus-visible) {
    --mix-alpha-value: 90%;
  }
}

.is-red {
  --mix-red: var(--mix-red--on);
}
```

A few notes:

1. For the third element, _both_ `with-alpha` and `is-red` classes are applied. But because the `mixins.red` layer comes after the `mixins.alpha`, its properties “win”.

2. The mixins are completely separate and both can override the `color`, but either can apply only based on its custom property!

3. Nothing stops us from using additional variables that we can pass to the mixin’s code. I did not guard them against other mixins, but it is also possible to wrap them with the cyclic toggles conditions if necessary.

### Merging Mixins

You could’ve noticed that right now, either mixin does not know about the other, making it so the `red` one completely overrides the `alpha`. Can we somehow make them work together?

There are many ways to handle this, but the one I find the best is to modify the usage of the later mixin to fall back to the earlier if it detects its state. This way, it is possible to conditional `revert-layer` to get the values from the earlier mixin in place:

{{<Partial src="examples/layered-toggles-2-cascading-merge.html" />}}

Here is what is different:

```CSS
@layer mixins.red {
  * {
    color:
      var(--mix-red--off, revert-layer)
      var(--mix-red--on,
        var(--mix-alpha--off, #FFF)
        var(--mix-alpha--on, revert-layer)
      );
    --mix-alpha-color:
      var(--mix-red--off, revert-layer)
      var(--mix-red--on, #FFF);
  }
}
```

1. When our `red` mixin is on, we also check the other mixin: if it is enabled, then we know that we can rely on it.

2. But how do we change the color to white? Easy: the other mixin provides a `--mix-alpha-color` variable that we can use!

Note how here either mixin knows about what the other is doing: the `alpha` gets the value of `--mix-alpha-color` that the `red` defines, and the `red` knows that the `alpha` is active, and reverts to its handling of `color`!

Also, when testing all the examples in Safari, I found a bug in WebKit with the `revert-layer` when used in a nested variable fallback, which leads to hover in the above example not working in it. I’ll fill a big about this at a later point and will update this paragraph to include a link to it.

### Using With Style Queries

You could’ve asked: why are we not using [container style queries](https://developer.chrome.com/docs/css-ui/style-queries) for this? There are two main answers:

- Style queries are not supported everywhere: when I write this, they’re only available in stable Chromium-based browsers, and in [Safari Technology Preview](https://developer.apple.com/documentation/safari-technology-preview-release-notes/stp-release-190#New-Features).

- Even if they were available everywhere, it is not possible to style _the element with a CSS variable itself_ with them — only the descendants.

However, when we get style queries everywhere, could we use them in tandem with this technique:

{{<Partial class="require-style-queries"  src="examples/layered-toggles-3-style-queries.html" screenshot="true" video="true">}}
  Hovering of focusing over any element highlights a direct child nested inside.
{{</Partial>}}

Hovering on any element, Here is the CSS for this example:

```CSS
@layer mixins.child-hover {
  * {
    --mix-child-hover: var(--mix-child-hover--off);
    --mix-child-hover--off: var(--mix-child-hover,);
    --mix-child-hover--on:  var(--mix-child-hover,);

    /* Applies only to the direct children of the element */
    @container style(--mix-child-hover--off: ) {
      background: var(--GREEN);
      color: CanvasText;
    }
  }
}

/* Applying mixin */
.child-hover:is(:hover, :focus-visible):not(:has(.child-hover:is(:hover, :focus-visible))) {
  --mix-child-hover: var(--mix-child-hover--on);
}
```

We can hook into the value of either `--mix-child-hover--on` or `--mix-child-hover--off`, and style this element’s _direct child_ based on its parent’s cyclic toggle value, as it will be either an empty value or `initial`.

Note that in Safari Technology Preview [there is a bug](https://bugs.webkit.org/show_bug.cgi?id=270739) with the `initial` inside the style queries, so in the example above we’re checking for `style (--mix-child-hover--off:)`; in Chrome the `style (--mix-child-hover--on: initial)` will work as well.


## Use Cases

The examples above are very basic, mostly because I wanted to share them as soon as possible. I could probably spend a few weeks coming up with many examples, but I feel that there might be _too many_ of them. Almost anything that you could want a native CSS mixin could be implemented with layered toggles, I believe.

That might be your homework: think of anything reusable in your CSS — could it be separated into a mixin like that? I will be happy to look at what all of you will do with this.

There are many articles on the internet which you could use as an inspiration, with small snippets of code that can be converted into mixins like that. I can recommend starting with [SmolCSS](https://smolcss.dev/) by [Stephanie Eckles](https://thinkdobecreate.com/), and [CSS Tip](https://css-tip.com/) by [Temani Afif](https://css-articles.com/). There are many, many other resources, so don’t stop at these!

- - -

### Update from 2024-04-10 {#update-2024-04-10}

- As a start, I did create [a CodePen](https://codepen.io/kizu/pen/BaExxxz) that combines [Stephanie](https://thinkdobecreate.com/)’s [flex](https://smolcss.dev/#smol-flexbox-grid) and [grid](https://smolcss.dev/#smol-css-grid) layouts into one mixin.

    The flex one requires style queries to work, but the grid one will work everywhere where `@layer` is supported! We can see how the code is hardly readable, _but it works_! One interesting moment to note is that if we’d want to use some variables on the children that are defined on the parent, we’d need to explicitly `inherit` these variables, as otherwise they will be reset on every element due to the universal selector.

- And another example: [a CodePen for visually-hidden mixin](https://codepen.io/kizu/pen/PogeBNd?editors=1100), based on the code from the [“The Web Needs a Native .visually-hidden”](https://benmyers.dev/blog/native-visually-hidden/) article by [“Ben Myers”](https://benmyers.dev/), inspired by a [“Native visually hidden”](https://cssence.com/2024/native-visually-hidden/) post by [Matthias Zöchling](https://cssence.com/).

    This one should work everywhere where we have `@layer`.

## Future of Mixins

While I’m happy this technique is possible, it can still look rather hacky, and cyclic toggles are not very fun to debug right now. Good news: there is a [Custom CSS Functions & Mixins proposal](https://github.com/w3c/csswg-drafts/issues/9350) by [Miriam Suzanne](https://www.miriamsuzanne.com/) which was [accepted](https://github.com/w3c/csswg-drafts/issues/9350#issuecomment-1939628591) by CSSWG as something to pursue. However, it is yet unknown which exact form it will take, and it can take years until we could use whatever will get into the specifications and later into browsers. CSS Layers are already here, and style queries will be sooner rather than later too, and the best thing we could do for the future of mixins — is prototype them with what we can today. This could allow us to gather common use cases, uncover potential issues, work out how they could interact with other CSS features, and so on.


## Final Words

I wrote this article very soon after discovering the technique. I want to re-iterate that you probably don’t want to use it in production right away, both due to still not perfect browser support, and the overall novelty: we don’t know which issues we can uncover with it.

On the other hand, this technique is so new, that we don’t know what it unlocks _next_. In the same way, space toggles[^space-toggles] did unlock cyclic toggles, and cyclic toggles now unlocked layered toggles, something else could be on the horizon, and we just need to continue trying to go beyond what, we think, is possible.

[^space-toggles]: Discovered independently [by many people over many years](/cyclic-toggles/#was-this-always-possible), including [Ana Tudor](https://thebabydino.github.io/), [Jane Ori](https://propjockey.io/about/), [David Khourshid](https://github.com/davidkpiano), and [Lea Verou](https://lea.verou.me/about/). <!-- offset="1" -->

