---
mastodon_post_id: "113899865675690994"
---

# Pure CSS Mixin for Displaying Values of Custom Properties

#CSS_Variables #CSS_Logic #CSS_Layers #Experiment #Practical #CSS

_Do you write CSS? Do you use custom properties with calculations? Do you want to preview their values while you’re debugging them? What if you could do so by setting just one additional custom property? Without any JS? In this article, I present a native CSS mixin that will output various values as pseudo-elements._

<style>
	.ToC.ToC {
		grid-row-end: span 11;
	}

	code[class][class] {
		tab-size: 2;
	}
</style>

## The Problem

Let’s say we have some CSS variable that calculates some value based on [`cqi`](https://drafts.csswg.org/css-conditional-5/#container-lengths) and `em` applied to some class `.test1`:

<div style="display: var(--initial-at-small, grid); grid: 'content figure' / 1.2fr 1fr; gap: 1rem">

<style>
  .test1 {
    --width: calc(50cqi + 2em);
  }
</style>

```CSS
.test1 {
	--width: calc(50cqi + 2em);
}
```

<figure style="container-type: inline-size; overflow: auto; resize: horizontal; grid-column: figure; align-self: center; margin: 0">
  <div class="test1">How wide is <code>--width</code>?</div>
</figure>

</div>

We don’t know how wide it is. And browsers don’t know it as well: after all, custom properties are not evaluated until used. No browser devtools[^but-should] will tell you this. One way to _see_ it is to apply it to something:

[^but-should]: I think that they _should_ — in the same way you will see me doing it in this article later. There is no reason browsers’ devtools should not be able to evaluate any variable even when it is not registered. It is possible — and useful — to match it against different types as applied to the currently inspected element, showing potential ways it can be interpreted. <!-- span="3" offset="2" -->

<div style="display: var(--initial-at-small, grid); grid: 'content figure' / 1.2fr 1fr; gap: 1rem">

```CSS
.test2 {
  --width: calc(50cqi + 2em);
  width:   var(--width);
  padding: 0.5em;
  background: var(--PINK);
}
```

<style>
  .test2 {
    --width: calc(50cqi + 2em);
    width:   var(--width);
    padding: 0.5em;
    background: var(--PINK);
  }
</style>

<figure style="container-type: inline-size; overflow: auto; resize: horizontal;grid-column: figure; align-self: center; margin: 0">
  <div class="test2">How wide is <code>--width</code>?</div>
</figure>

</div>

Will the browser devtools help us to know the exact value _now_? Only if we will go to the “computed style” panel, and look at the final value of the `width` property. The computed value won’t be available in the regular “styles” panel, and, as we now have padding[^padding], but no `box-sizing: border-box`, we can’t even rely on the browser displaying the dimensions.

[^padding]: I know, it was not strictly necessary for this minimal example, but I wanted to demonstrate that in real use cases there might be additional styles that won’t make it easier for us to get to the final value. <!-- offset="-3" span="4" -->

And then, there is the need to open the devtools in the first place, inspect the exact element, and so on.

What if there is a better way?

## The Solution

What if we could _preview_[^preview-outline] the value without applying it?

[^preview-outline]: On this page, most pseudo-elements added by this mixin will be outlined with red dots. <!-- span="2" -->

```CSS
.test3 {
  --width:   calc(50cqi + 2em);
  --preview: var(--width); /* ☜ Oh what’s that? */
}
```

<style>
  .test3 {
    --width:   calc(50cqi + 2em);
    --preview: var(--width);
  }
</style>
<figure style="container-type: inline-size; overflow: auto; resize: horizontal;">
  <div class="test3">How wide is <code>--width</code>? </div>
</figure>

If we want to know the computed value, the only thing we need is to add `--preview: var(--width)`, and we get the result[^result-evaluation]!

[^result-evaluation]: As evaluated on the element itself: in this case, we have a container set up around our `.test3` element, so it gets the `cqw` value from it, and the current element’s font-size. Resize the container — and the value will change! <!-- offset="1" span="3" -->

What if we’re curious about some other things?

```HTML
<ul>
  <li style="--preview: 1rem">   1rem = </li>
  <li style="--preview: 1em">     1em = </li>
  <li style="--preview: 1lh">     1lh = </li>
  <li style="--preview: 1rad">   1rad = </li>
  <li style="--preview: 100vw"> 100vw = </li>
  <li style="--preview: pi">        𝝅 ≈ </li>
  <li style="--preview: 2 * pi">    𝝉 ≈ </li>
  <li style="--preview: var(--PINK)">var(--PINK): </li>
</ul>
```

<figure>
  <ul>
		<li style="--preview: 1rem">   1rem = </li>
		<li style="--preview: 1em">     1em = </li>
		<li style="--preview: 1lh">     1lh = </li>
		<li style="--preview: 1rad">   1rad = </li>
		<li style="--preview: 100vw"> 100vw = </li>
		<li style="--preview: pi">        𝝅 ≈ </li>
		<li style="--preview: 2 * pi">    𝝉 ≈ </li>
		<li style="--preview: var(--PINK)">var(--PINK): </li>
  </ul>
</figure>

There are, indeed, many things we can display this way! Ok, maybe we can’t get the exact _stringified_ value of the colors, but we can at least show them as, well, actual colors!

All we had to do: add a single custom property: `--preview`. At first, we did it inside a regular rule, then used inline styles directly. Any other way[^inspect] would work as well!

[^inspect]: See the [“Inspector”](#inspector) use case for an example of applying it dynamically. <!-- span="2" offset="2" -->

So, what is happening? How does it work? Can you somehow use it for debugging your CSS projects?

## Quick Take-Away

With this article, I present you a native CSS mixin that allows us to do this (no JS involved). I did also publish an [npm package](https://www.npmjs.com/package/@kizu/mixins), which[^all-mixins], with the help of CDNs like unpkg.com can be a fast way to get this mixin in your CodePens, for example.

[^all-mixins]: I am planning to use a single repo for all my mixins, but, for now, this preview mixin is the only thing there. <!-- offset="2" span="2" -->

If you want to play with this mixin, feel free to use the package, copy the mixin itself, or just open the devtools on this article’s page, and play with the `--preview` custom property on any element.

Of course, a necessary disclaimer[^browser-support]: **this is highly experimental!** You probably don’t want to include this mixin’s code anywhere near your production code. But in a dev environment? Or on CodePen? That’s the best place for experimental tech like that, where you’re the main user.

[^browser-support]: That said, the browser support for the mixin is pretty good: it should work in all the latest versions of major browsers.

### The Package

My main use case for it — having it available for any [CodePen](https://codepen.io/kizu/pen/PwYyJaR) and other experiments I create, as a quick way to debug things.

It is possible to include the mixin in HTML from any CDN:

```HTML
<link
	rel="stylesheet"
	type="text/css"
	href="https://unpkg.com/@kizu/mixins@0.1.3/preview.css"
/>
```

Or from CSS

```CSS
@import
	url("https://unpkg.com/@kizu/mixins@0.1.3/preview.css");
```

Or you can install it[^other-mixins] from npm: `npm install @kizu/mixins` or `yarn add @kizu/mixins`, and then include it from there.

[^other-mixins]: I created a package named “mixins”, as I am planning to add more of them to it. For now, there is only the one from this article. <!-- span="2" -->

I published it in as minimal a setup as I could. I forgot when I published a package the last time, so uh, yeah. Please tell me if you’d like me to make any changes to the package setup (but I do not promise to follow your suggestions). Here is a [GitHub repo](https://github.com/kizu/mixins) for it.

### The Mixin

You can read the full code[^full-code] of the mixin here under the `<details>`. Alternatively, you can [read it in full on GitHub](https://github.com/kizu/mixins/blob/main/preview.css) as well.

[^full-code]: The code is for the 0.1.3 version. It is thoroughly commented and presented: out of 800+ lines, almost half are the comments and [indentation](https://blog.kizu.dev/calc-indent/). <!-- span="3" -->

<details>
<summary class="Link Link_pseudo">The full code of the mixin (long, open at your own risk!)</summary>

```CSS
/*
	Read the full write-up about this mixin:
	https://kizu.dev/preview-mixin/

	This is a “native” CSS mixin. It relies on
	a few specific CSS interactions, see
	https://kizu.dev/indirect-cyclic-conditions/
	for the details which cover this `--WHEN` custom
	property, why we use custom cascade layers, etc.
*/
:root { --WHEN: }

/*
	Most of the custom properties inside are registered,
	see the list after the mixin.
*/
@layer mixins.preview {
	/*
		The mixin can be used on any element itself,
		or on a pseudo-element directly.
		An `::after` will override the element itself.
	*/
	*,
	*::before,
	*::after {
		/*
			The key custom property adding which to
			any element turns the mixin on.
		*/
		--preview:
			/*
				We need to cross-reference these to create
				the initial cyclic deps. See
				https://kizu.dev/indirect-cyclic-conditions/
			*/
			var(--_p-reset)
			var(--_p-content)
			var(--_p-color)
			var(--_p-reset-value)
			var(--_p-content-value)
			var(--_p-color-value)

			/* Not used in the mixin, allows extensions. */
			var(--preview--toggle)
		;

		/*
			A space toggle that could be used as an API.
			- `initial` when mixin is off.
			- empty when it is on.
		*/
		--preview--toggle: var(--WHEN, var(--preview));

		/* Capturing `<dimension>`-like types. */
		/*
			We need `calc()` to catch any stray math
			like `pi`, `2 + 2` etc.
		*/
		--_p-captured: calc(var(--preview));

		/*
			The next 5 declarations attempt to cast the
			value as `<number>` from different other types.
		*/
		/*
			Nothing special is required for cating
			from `<number>`
		*/
		--_p-from-number: var(--_p-captured);

		/*
			To cast other dimension-like values we need to
			“divide” them by the the same unit to get the
			`<number>` in the end. See
			https://dev.to/janeori/css-type-casting-to-numeric-tanatan2-scalars-582j

			The additional division and multiplication
			10000 is a workaround for a Firefox bug:
			https://bugzilla.mozilla.org/show_bug.cgi?id=1939353

			In the future, we could just do
			`calc(var(--_p-captured) / 1px)` etc.
		*/
		--_p-from-length: calc(
			10000
			*
			tan(atan2(var(--_p-captured), 10000px))
		);

		--_p-from-angle: calc(
			10000
			*
			tan(atan2(var(--_p-captured), 10000deg))
		);

		/*
			I find it easier to work with `ms`,
			so we're accounting for this here.
		*/
		--_p-from-time: calc(
			10000000
			*
			tan(atan2(var(--_p-captured), 10000s))
		);

		--_p-from-percentage: calc(
			10000
			*
			tan(atan2(var(--_p-captured), 10000%))
		);

		/*
			The final “value” will have only one of
			the components !== 0.
		*/
		--_p-value: (
			var(--_p-from-length)
			+
			var(--_p-from-number)
			+
			var(--_p-from-angle)
			+
			var(--_p-from-time)
			+
			var(--_p-from-percentage)
		);

		/*
			When trying to output the fractional value with
			counters, it is more convenient to work with
			the absolute values, and separate the sign.

			In the future, it could be just `abs()` and
			`sign()` (Chrome, hello?).
		*/
		--_p-value-abs:
			max(var(--_p-value), -1 * var(--_p-value));

		--_p-sign:
			calc(var(--_p-value) / var(--_p-value-abs));

		/*
			Here we split our value to contain the integer
			and the decimal parts. For the integer, we use
			`round()`. The `0.0001` there is a workaround
			for a Firefox bug:
			https://bugzilla.mozilla.org/show_bug.cgi?id=1924363
		*/
		--_p-part1:
			round(down, var(--_p-value-abs) + 0.0001, 1);

		--_p-part2: round(
			(var(--_p-value-abs) - var(--_p-part1))
			*
			/*
				While we could implement more than 3 digits
				after the dot, it is much more convenient
				to work with fewer of them, and we rarely
				need more.
			*/
			1000,
			/*
				When rounding, we always keep the `1`,
				which is required for Safari, as it did not
				yet implement the implicit `1` argument.
			*/
			1
		);

		/*
			We need to further split the fractional part
			into separate digits, as otherwise we couldn’t
			properly output values like `001` with counters.
		*/
		--_p-d1: round(down, var(--_p-part2) / 100, 1);

		--_p-d2: round(
			down,
			var(--_p-part2) / 10 - var(--_p-d1) * 10,
			1
		);

		--_p-d3: round(
			var(--_p-part2)
			-
			var(--_p-d1) * 100
			-
			var(--_p-d2) * 10
			,
			1
		);

		/*
			Most other calculations were moved into the
			`counter-reset` itself, but when we need to
			reuse the value, it might be present as a
			variable.

			The specifics about what this and some
			other calculations do are in the full write-up:
			https://kizu.dev/preview-mixin/

			In short, this checks if we need to display the
			zero symbol after the dot.
		*/
		--_p-zero1: calc(
			var(--_p-d1) + max(0, 1 - var(--_p-part2))
		);

		/*
			Checking if the value is empty: `1` when it is,
			will use initial value which is `0` otherwise.
		*/
		--_p-is-empty: 1 var(--preview);

		/*
			Checking if the value is `initial`/“IACVT”.
			As it will also catch the empty value, and we
			already checked it, we can narrow it down.
		*/
		--_p-is-initial:
			calc(1 - var(--_p-is-empty)) var(--preview,);

		/*
			Type-grinding the value to check if it is a
			string. It can accept multiple strings, and we
			use `""` to exclude numbers.

			This means we will later need to exclude empty
			values when displaying quotes.
		*/
		--_p-is-string-or-0: var(--preview) "";
		--_p-is-string:
			var(--_p-has-strings, var(--_p-is-string-or-0))
			var(--_p-no-strings, 0);

		/*
			We consider the value to be a number if it is
			not a string, empty, or initial. This is not
			the only check, we will later need to exclude
			custom idents via a different technique.
		*/
		--_p-is-number: max(
			0,
			1
			-
			var(--_p-is-string)
			-
			var(--_p-is-empty)
			-
			var(--_p-is-initial)
		);

		/* Type-grinding idents that we know of */
		--known-ident:        var(--preview);
		--_p-is-1-if-known:   var(--known-ident);
		--_p-is-known:        var(--_p-is-1-if-known);

		--_p-builtin-ident:   var(--preview);
		--_p-is-1-if-builtin: var(--_p-builtin-ident);
		--_p-is-builtin:      var(--_p-is-1-if-builtin);

		--_p-is-custom-ident: var(--preview);
		--_p-is-none-or-0:    var(--_p-is-custom-ident);
		--_p-is-none:         var(--_p-is-none-or-0);

		/*
			Checking if the value is a color. `color-mix()`
			allows us to switch to a `0` for any non-color
			value while excluding numbers.
		*/
		--_p-is-color-or-0:
			color-mix(in hsl, var(--preview) 100%, red 0%);
		--_p-is-color: var(--_p-is-color-or-0);

		/*
			Problem with the `color` is that it will result
			in `currentColor`, overriding any color that is
			set on the pseudo otherwise. Maybe we could use
			keyframed toggles to do this? We could do just
			`color-mix(in oklch, var(--preview,), red 0%)`,
			but Safari will fail in some cases.
		*/
		--_p-color: color-mix(
			in oklch,
			var(--preview,) calc(100% * var(--_p-is-color)),
			currentColor
		);

		/*
			Defining the value for `counter-reset`,
			with all the parts needed.
		*/
		--_p-reset:
			var(--WHEN, var(--preview))
			--_p-is-color   var(--_p-is-color)
			--_p-is-none    var(--_p-is-none)
			--_p-is-empty   var(--_p-is-empty)
			--_p-is-initial var(--_p-is-initial)
			/*
				Empty value will result in false-positive
				is-string, need to narrow.
			*/
			--_p-quote max(
				0,
				var(--_p-is-string) - var(--_p-is-empty)
			)
			--_p-sign var(--_p-sign)
			--_p-part1 calc(
				/*
					Apply the part value only if it is
					an actual number.
				*/
				var(--_p-part1) * var(--_p-is-number)
				+
				/*
					Otherwise, it can be 424242..424244
					based on various factors, in which case
					it will be omitted, but could be used to
					display other values if necessary,
					like for idents or colors.
				*/
				424242 * (1 - var(--_p-is-number))
				+
				var(--_p-is-builtin)
				+
				var(--_p-is-known)
				+
				var(--_p-is-none)
				+
				var(--_p-is-color)
			)
			--_p-dot   var(--_p-part2)
			--_p-zero1 var(--_p-zero1)
			--_p-zero2 calc(var(--_p-zero1) + var(--_p-d2))
			--_p-part2 calc(
				var(--_p-d1)
				*
				clamp(
					1,
					10 * (var(--_p-d2) + var(--_p-d3)),
					10
				)
				+
				var(--_p-d2)
			)
			--_p-part3 var(--_p-d3)

			/*
				As we don’t have `round(from-zero, …)`,
				we have to use `abs()` and round up,
				so we will get a `0` or a positive
				non-fractional number.

				Although, as we have the `--_p-sign` we can
				use it instead of a `max()` workaround.

				If we could do `from-zero`, we could be ok
				with negative values too.
			*/
			--_p-unit-px round(
				up,
				var(--_p-from-length) * var(--_p-sign),
				1
			)
			--_p-unit-deg round(
				up,
				var(--_p-from-angle) * var(--_p-sign),
				1
			)
			--_p-unit-ms round(
				up,
				var(--_p-from-time) * var(--_p-sign),
				1
			)
			--_p-unit-perc round(
				up,
				var(--_p-from-percentage) * var(--_p-sign),
				1
			)
		;

		/* For strings, we just need to ensure the type */
		--_p-as-string: var(--preview);

		/*
			Defining the value for `content`, with all the
			parts needed. The second argument is the
			`@counter-style`, which determine how to display
			things. See the list of them in the end.
		*/
		--_p-content:
			var(--WHEN, var(--preview))
			var(--preview-prefix,)

			/*
				We don’t have a good way to convert an ident
				to a string for now, so we have to use a
				finite list of custom styles for this.
			*/
			counter(_, var(--known-ident))
			counter(_, var(--_p-builtin-ident))
			/*
				We can’t have a style with the name `none`,
				so we grind for it.
			*/
			counter(--_p-is-none, --_p-is-none)
			/*
				The captured value that is used here will
				be 424243, and if we don’t change it
				otherwise (when we can detect a
				non-dimension type), we show `<unknown>`.
			*/
			counter(--_p-part1, --_p-is-unknown)
			/*
				Otherwise, we show some other
				detected types.
			*/
			counter(--_p-is-color,   --_p-is-color)
			counter(--_p-is-empty,   --_p-is-empty)
			counter(--_p-is-initial, --_p-is-initial)

			/*
				For strings, we can wrap the value with
				single quotes. Note that for multiple
				strings inside a value we cannot map
				through them sadly.
			*/
			counter(--_p-quote, --_p-quote)
			var(--_p-has-strings, var(--_p-as-string))
			counter(--_p-quote, --_p-quote)

			/*
				The `<dimension>`-like values:
				we separate all the parts.
			*/
			counter(--_p-sign,      --_p-sign)
			counter(--_p-part1,     --_p-as-number)
			counter(--_p-dot,       --_p-has-dot)
			counter(--_p-zero1,     --_p-leading-zero)
			counter(--_p-zero2,     --_p-leading-zero)
			counter(--_p-part2,     --_p-has-decimals)
			counter(--_p-part3,     --_p-has-decimals)
			counter(--_p-unit-px,   --_p-unit-px)
			counter(--_p-unit-deg,  --_p-unit-deg)
			counter(--_p-unit-ms,   --_p-unit-ms)
			counter(--_p-unit-perc, --_p-unit-perc)

			var(--preview-suffix,)
		;
	}

	* {
		/*
			If we want to use the values calculated on the
			element on the pseudos, we need to explicitly
			inherit them via separate custom properties.
		*/
		--_p-reset-inherited:   var(--_p-reset);
		--_p-content-inherited: var(--_p-content);
		--_p-color-inherited:   var(--_p-color);

		/*
			Cyclic toggles for switching the default place
			we output the `--preview` when it is defined
			on the element itself.
		*/
		--preview-position: var(--preview--after);
		--preview--after:   var(--preview-position,);
		--preview--before:  var(--preview-position,);
	}

	/*
		Saving the values of cyclic toggles with different
		names based on position
	*/
	*::before {
		--preview--inherited: var(--preview--before);
		--preview--self:      var(--preview--after);
	}
	*::after {
		--preview--inherited: var(--preview--after);
		--preview--self:      var(--preview--before);
	}

	*::before,
	*::after {
		/*
			If we want to be able to set the value either
			on a pseudo, or on the element itself, we need
			to have a few more custom properties.
		*/
		--_p-reset-value:
			var(--_p-reset)   var(--WHEN, var(--preview));

		--_p-content-value:
			var(--_p-content) var(--WHEN, var(--preview));

		--_p-color-value:
			var(--_p-color)   var(--WHEN, var(--preview));

		--_p-reset-final: var(
			--_p-reset-value,
			var(--_p-reset-inherited)
		);
		--_p-color-final: var(
			--_p-color-value,
			var(--_p-color-inherited)
		);

		/*
			Use different values based on
			the `--preview-position`
		*/
		--preview-content:
			var(--preview--self, var(--_p-content))
			var(--preview--inherited, var(
				--_p-content-value,
				var(--_p-content-inherited)
			))
		;
		--preview-reset:
			var(--preview--self,      var(--_p-reset))
			var(--preview--inherited, var(--_p-reset-final))
		;

		content:       var(--preview-content, revert-layer);
		counter-reset: var(--preview-reset,   revert-layer);
		color:
			var(
				--preview--self,
				var(--_p-color,       revert-layer)
			)
			var(
				--preview--inherited,
				var(--_p-color-final, revert-layer)
			)
		;
	}

	/*
		Safari < 18.2 does not support `<string>` inside
		`@property`, so we have to hide anything related
		to it behind space toggles for everything else
		to work correctly.
	*/
	body {
		--_p-has-strings: ;
		--_p-no-strings: initial;
	}

	/*
		Safari supports container style queries from 18,
		so we can use them to detect the `<string>`
		support, and if there is no styler queries,
		things will still work.
	*/
	@container style(--_p-as-string: "") {
		body {
			--_p-has-strings: initial;
			--_p-no-strings: ;
		}
	}

	/*
		Note: everything below is inside a layer because
		otherwise it did not work when used in my blog's
		setup, for some reason. But also, no reason to not
		add it outside of the layer if we can have it here.
	*/

	/*
		It is possible to override this definition from
		outside and provide other defined `@counter-style`
		in its `syntax` (while keeping the `empty`).
	*/
	@property --known-ident {
		syntax:       "empty";
		initial-value: empty;
		inherits:      false;
	}

	/*
		This is the built-in lists, which shows how it
		is done for a few of them.
	*/
	@property --_p-builtin-ident {
		syntax:       "auto|max-content|min-content|empty";
		initial-value: empty;
		inherits:      false;
	}

	/* This is how the known idents should be defined. */
	@counter-style auto {
		system:   cyclic;
		symbols: "auto";
	}
	@counter-style max-content {
		system:   cyclic;
		symbols: "max-content";
	}
	@counter-style min-content {
		system:   cyclic;
		symbols: "min-content";
	}

	/* At the moment we don’t cover all `<dimension>`. */
	@property --_p-captured {
		syntax:
			"<number>|<length>|<angle>|<time>|<percentage>";
		/*
			Will be used to display `<unknown>` when not
			matching a dimension, and if it is not modified
			by some other detected type.
		*/
		initial-value: 424243;
		inherits:      false;
	}

	/*
		Variables for detecting the dimension type: they all
		have the same type, but will be called with
		different types and used later to display units.
	*/
	@property --_p-from-number {
		syntax:       "<number>";
		initial-value: 0;
		inherits:      false;
	}
	@property --_p-from-length {
		syntax:       "<number>";
		initial-value: 0;
		inherits:      false;
	}
	@property --_p-from-angle {
		syntax:       "<number>";
		initial-value: 0;
		inherits:      false;
	}
	@property --_p-from-time {
		syntax:       "<number>";
		initial-value: 0;
		inherits:      false;
	}
	@property --_p-from-percentage {
		syntax:       "<number>";
		initial-value: 0;
		inherits:      false;
	}

	/*
		Captured string, so we can easily display it
		right away.
	*/
	@property --_p-as-string {
		syntax:       "<string>+";
		initial-value: "";
		inherits:      false;
	}

	/*
		Below are all the type grinding that is going on
		for detecting various types. See
		https://www.bitovi.com/blog/css-only-type-grinding-casting-tokens-into-useful-values
	*/
	@property --_p-is-string-or-0 {
		syntax:       "<string>+|<number>";
		initial-value: 0;
		inherits:      false;
	}
	@property --_p-is-string {
		syntax:       "<number>";
		initial-value: 1;
		inherits:      false;
	}

	@property --_p-is-empty {
		syntax:       "<number>";
		initial-value: 0;
		inherits:      false;
	}

	@property --_p-is-initial {
		syntax:       "<number>";
		initial-value: 0;
		inherits:      false;
	}

	@property --_p-is-custom-ident {
		syntax:       "<custom-ident>";
		initial-value: not-none;
		inherits:      false;
	}

	@property --_p-is-none-or-0 {
		syntax:       "none|<integer>";
		initial-value: 0;
		inherits:      false;
	}
	@property --_p-is-none {
		syntax:       "<integer>";
		initial-value: 1;
		inherits:      false;
	}

	@property --_p-is-1-if-builtin {
		syntax:       "empty|<integer>";
		initial-value: 1;
		inherits:      false;
	}
	@property --_p-is-builtin {
		syntax:       "<integer>";
		initial-value: 0;
		inherits:      false;
	}

	@property --_p-is-1-if-known {
		syntax:       "empty|<integer>";
		initial-value: 1;
		inherits:      false;
	}
	@property --_p-is-known {
		syntax:       "<integer>";
		initial-value: 0;
		inherits:      false;
	}

	@property --_p-is-color-or-0 {
		syntax:       "<color>|<integer>";
		initial-value: 0;
		inherits:      false;
	}
	@property --_p-is-color {
		syntax:       "<integer>";
		initial-value: 1;
		inherits:      false;
	}

	/*
		Below are various counter-styles used for
		conditional output of various parts of the
		`content` by matching certain values.
	*/

	/*
		Not prefixed as exposed to be used
		in `--known-ident` definition.
	*/
	@counter-style empty {
		system:  cyclic;
		symbols: "";
	}

	/*
		We can’t have a counter-style `none`,
		so need to grind to it.
	*/
	@counter-style --_p-is-none {
		system:   cyclic;
		symbols: "none";
		/*
			Here and below, we can use `range` to select
			when to apply the value, otherwise the
			counter-style from the `fallback` will be used.
		*/
		range:    1 1;
		fallback: empty;
	}

	/* The rest of conditional counters. */

	@counter-style --_p-unit-px {
		system:   cyclic;
		symbols: "px";
		range:    1 infinite;
		fallback: empty;
	}
	@counter-style --_p-unit-deg {
		system:   cyclic;
		symbols: "deg";
		range:    1 infinite;
		fallback: empty;
	}
	@counter-style --_p-unit-ms {
		system:   cyclic;
		symbols: "ms";
		range:    1 infinite;
		fallback: empty;
	}
	@counter-style --_p-unit-perc {
		system:   cyclic;
		symbols: "%";
		range:    1 infinite;
		fallback: empty;
	}
	@counter-style --_p-sign {
		system:   cyclic;
		symbols: "-";
		range:    -1 -1;
		fallback: empty;
	}
	@counter-style --_p-as-number {
		system:  cyclic;
		symbols: "";
		/*
			The range for our “system” values,
			for which we don’t show the number.
		*/
		range: 424242 424244;
	}
	@counter-style --_p-has-dot {
		system:   cyclic;
		symbols: ".";
		range:    1 infinite;
		fallback: empty;
	}
	@counter-style --_p-leading-zero {
		system:  cyclic;
		symbols: "";
		range:   1 infinite;
	}
	@counter-style --_p-has-decimals {
		system:  cyclic;
		symbols: "";
		range:   0 0;
	}
	@counter-style --_p-is-unknown {
		system:   cyclic;
		symbols: "<unknown>";
		/*
			The `424243` will come from the `initial-value`
			of captured dimension.
		*/
		range:    424243 424243;
		fallback: empty;
	}
	@counter-style --_p-quote {
		system:   cyclic;
		symbols: "'";
		range:    1 1;
		fallback: empty;
	}
	@counter-style --_p-is-empty {
		system:   cyclic;
		symbols: "<empty>";
		range:    1 1;
		fallback: empty;
	}
	@counter-style --_p-is-initial {
		system:   cyclic;
		symbols: "<initial>";
		range:    1 1;
		fallback: empty;
	}

	@counter-style --_p-is-color {
		system:   cyclic;
		symbols: "■";
		range:    1 1;
		fallback: empty;
	}
}
```

</details>

After presenting the mixin’s API and a few [use cases](#use-cases), I will go into some — but not all — details of how the mixin works. Decide for yourself if you want to first try and understand what is going on in its source code.

## Mixin’s API

Basic usage is trivial: after including the mixin’s code on your page, just adding a `--preview` custom property on any element (or its `::before` or `::after` pseudo-element) will turn the mixin on[^resize-viewport]:

[^resize-viewport]: The value is fully dynamic: if you can resize your browser’s viewport, you can see the value changing in response. <!-- offset="2" span="3	" -->

```HTML
<div style="--preview: 100vw"></div>
```

<style>
.example > *::before {
  content: attr(style) " → ";
}
.example-after > *::after {
  content: " ← " attr(style);
}
</style>
<figure class="example">
  <div style="--preview: 100vw"></div>
</figure>

This mixin accepts many different types and calculations. The main limitations are: we can’t output the code for the colors, many unknown custom idents, or “complex” values — anything separated by spaces or commas, many functions, etc.

### Using Extra Elements to Debug

The mixin allows showing up to two values per element, via its `::before` and `::after` pseudo-elements.

If you need more: the best way to do so would be to add more elements, and preview the values on them:

```HTML
<div style="
	--a: 2 + 2;
	--b: sin(90deg);
	--c: none;
	--d: pi * e;
">
	<ul>
		<li	style="--preview: var(--a);"></li>
		<li	style="--preview: var(--b);"></li>
		<li	style="--preview: var(--c);"></li>
		<li	style="--preview: var(--d);"></li>
	</ul>
</div>
```

<figure>
	<div style="
		--a: 2 + 2;
		--b: sin(90deg);
		--c: none;
		--d: pi * e;
	">
		<ul>
			<li	style="--preview: var(--a);"></li>
			<li	style="--preview: var(--b);"></li>
			<li	style="--preview: var(--c);"></li>
			<li	style="--preview: var(--d);"></li>
		</ul>
	</div>
</figure>

Here we can see how, when we have multiple custom properties we want to debug on some element, we can output them with extra elements. By default, custom properties will be inherited, so this will, generally, work. If they were _not_ inherited (either via registering them with `inherits: false`, or when overriding them on `*`), we could always manually do so, like calling `--a: inherit` on the direct child of our element, and repeating for more nested DOM.

### Changing the Pseudo-Element

When set on the element itself, by default[^default-after] it will be output as `:after`, but it is possible to control by using a `--preview-position` [cyclic toggle](/cyclic-toggles/):

[^default-after]: I am still not certain that the `::after` is the best choice for the default. The reason I chose it — custom list styles often reuse the `::before`. <!-- span="2" -->

```HTML
<div style="
  --preview: 100vw;
  --preview-position: var(--preview--before);
"></div>
```

<figure class="example-after">
  <div style="--preview: 100vw; --preview-position: var(--preview--before)"></div>
</figure>

Note that in the above example, we manually switched where the `attr ()` is displayed, moving it from the `::before` to `::after`, while the position of the mixin’s output was determined only by `--preview-position` custom property.

There are two other cyclic toggles that depend on this: `var(--preview--inherited)` and `var(--preview--self)` which are available only on the `::before` and `::after` and which allow us to do things differently, based on the `--preview-position` value. There is an example of using them in the [“Checking If Mixing Is On”](#checking-if-the-mixin-is-on) section.

### Adding Idents

Out of the box, the mixin contains a very limited number of idents: `none`, `auto`, `min-content`, and `max-content`.

```HTML
<ul>
	<li style="--preview: none">none = </li>
	<li style="--preview: auto">auto = </li>
	<li style="--preview: min-content">min-content = </li>
	<li style="--preview: max-content">max-content = </li>
	<li style="--preview: hidden">hidden = </li>
</ul>
```

<figure>
  <ul>
    <li style="--preview: none">none = </li>
    <li style="--preview: auto">auto = </li>
    <li style="--preview: min-content">min-content = </li>
    <li style="--preview: max-content">max-content = </li>
    <li style="--preview: hidden">hidden = </li>
  </ul>
</figure>

Anything else will be displayed as `<unknown>`. There is currently no way to convert any unknown ident to a string in CSS — so we cannot do it just for anything. However, there is [a CSSWG issue](https://github.com/w3c/csswg-drafts/issues/542) by [Lea Verou](https://lea.verou.me/) about this, which could lead to an addition of the `string()` function to CSS (or something similar), which will help us in the future (and will, actually, make many of the techniques from this article obsolete, haha).

So, if we can’t display unknown idents, how do we display those above? Custom counter styles! I will get into what they are and how it works in [later sections](#conditional-counters-output), but thanks to them, the mixin has an API to define your own custom idents that would be added to this list.

Let’s say we want to add a `visible` ident to be displayed with our mixin. Here is how:

```CSS
@property --known-ident {
	syntax:       "empty|visible";
	initial-value: empty;
	inherits:      false;
}

@counter-style visible {
	system:   cyclic;
	symbols: "visible";
}
```

<style>
@property --known-ident {
	syntax:       "empty|visible";
	initial-value: empty;
	inherits:      false;
}

@counter-style visible {
	system:   cyclic;
	symbols: "visible";
}
</style>

<figure>
	<p style="--preview: visible">visible = </p>
</figure>

```HTML
<p style="--preview: visible">visible = </p>
```

There are two things we need to do:

1. Override the definition of the `--known-ident` registered custom property, adding our `visible` to its `syntax`. Very important: we need to keep the `empty` value there, as it is required for things to work.

2. Define a custom `@counter-style` with the name of our ident, and put it into its `symbols` as a string.

That’s it. If we were to define `hidden` as well, our `syntax` would look like `"empty|visible|hidden"`, etc.

#### Dashed Ident Bugs

Interestingly, if we try to add a dashed ident this way, today it will result in a bug in both [Chrome](https://issues.chromium.org/issues/386671303) and [Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1939501):

```CSS
@property --known-ident {
	syntax:       "empty|visible|--some-dashed-ident";
	initial-value: empty;
	inherits:      false;
}

@counter-style --some-dashed-ident {
	system:   cyclic;
	symbols: "--some-dashed-ident";
}
```

<style>
@property --known-ident {
	syntax:       "empty|visible|--some-dashed-ident";
	initial-value: empty;
	inherits:      false;
}

@counter-style --some-dashed-ident {
	system:   cyclic;
	symbols: "--some-dashed-ident";
}
</style>

<figure>
	<p style="--preview: --some-dashed-ident">--some-dashed-ident = </p>
</figure>

```HTML
<p style="--preview: --some-dashed-ident">--some-dashed-ident = </p>
```

If you open this example in Safari, it will work, though. This could actually be a bug not even in Chrome & Firefox, but in CSS Specs: [Anders Hartvoll Ruud](https://github.com/andruud) did open [a PR](https://github.com/w3c/css-houdini-drafts/pull/1137) to fix it based on my bug report. Sadly, there is currently no workaround for this.

### Checking If The Mixin Is On

Every pseudo-element that is output via our mixin on this page has a red dotted outline. This is implemented without modifying the mixin itself, but on top of its code. It is possible thanks to the `--preview--toggle` space toggle exposed by the mixin.

- When the mixin is off, this toggle has a value of `initial`.
- When the mixin is on, it will be an “empty” value.

With this, we can add conditional styles for both states. Here is how I added the dotted outline:

```CSS
@layer {
	* {
		--outline-value-inherited:
			3px dotted var(--RED) var(--preview--toggle);
	}

	*::before,
	*::after {
		outline: var(--outline-value, revert-layer);
		outline-offset: 1px;

		--outline-value-self:
			3px dotted var(--RED) var(--preview--toggle);

		--outline-value:
			var(--preview--inherited,
				var(--outline-value-self,
					var(--outline-value-inherited)))
			var(--preview--self,
				var(--outline-value-self))
		;
	}
}
```

<style>
@layer {
	* {
		--outline-value-inherited:
			3px dotted var(--RED) var(--preview--toggle);
	}

	*::before,
	*::after {
		outline: var(--outline-value, revert-layer);
		outline-offset: 1px;

		--outline-value-self:
			3px dotted var(--RED) var(--preview--toggle);

		--outline-value:
			var(--preview--inherited,
				var(--outline-value-self,
					var(--outline-value-inherited)))
			var(--preview--self,
				var(--outline-value-self))
		;
	}
}
</style>

There is a lot going on here aside from actually using the `var(--preview--toggle)`:

- Using an inherited custom property to be able to style the mixin when it is set both on the element itself, and on the pseudo-element.

- Using the `--preview--inherited` and `--preview--self` [cyclic toggles](/cyclic-toggles/) to be able to listen to the `--preview-position` and choose which value we need to use.

### Combining With Existing Pseudos

Because we’re wrapping our mixin in a custom cascade layer, its `content` (and `counter-reset`) could be overridden by the properties that will have more priority in the cascade. In the next two sections, I outline two ways to work around this.

#### Prefix and Suffix

It is possible to add any content before or after the displayed “preview” via `--preview-prefix` and `--preview-suffix` custom properties. This will allow us to combine some content with the preview if we can move the `content`.

They will be applied only if an element _has_ a preview, so it is safe to set on `*` in case you want this for all previews by default.

```HTML
<div style="
  --preview: 100vw;
  --preview-prefix: '(';
  --preview-suffix: ') ← ' attr(style);
"></div>
```

<figure>
  <div style="
    --preview: 100vw;
    --preview-prefix: '(';
    --preview-suffix: ') ← ' attr(style);
  "></div>
</figure>

We can tell how these prefixes were added to the content of the pseudo-element via the mixin by the red outline that we mentioned in the previous section.

#### Reusing Content and Reset

If we don’t want to remove the `content` (to always display the previous content always, for example), it is possible to reuse[^additive] the custom properties that `--preview` provides with the `counter-reset` and `content` properties.

[^additive]: Sadly, we don’t yet have something like [additive CSS](https://github.com/w3c/csswg-drafts/issues/1594), so we will have to prepare these properties in advance. Maybe one day we could just magically _append_ or _prepend_ the current winning value in the cascade instead of just overriding it. <!-- offset="1" span="3" -->

To do so, the mixin exposes two custom properties: `--preview-content` and `--preview-reset`, which we will need to add to our existing regular properties:


```CSS
.with-after::after {
	counter-reset:
		--custom-counter 42
		var(--preview-reset,)
	;

	--preview--toggle: inherit;
	--when-with-preview:
		", and a preview: "
		var(--preview--toggle)
	;

	content:
		"Some content! With a custom counter: "
		counter(--custom-counter)
		var(--when-with-preview,)
		var(--preview-content,)
	;
}
```

<style>
.with-after::after {
	counter-reset:
		--custom-counter 42
		var(--preview-reset,)
	;

	--preview--toggle: inherit;
	--when-with-preview:
		", and a preview: "
		var(--preview--toggle)
	;

	content:
		"Some content! With a custom counter: "
		counter(--custom-counter)
		var(--when-with-preview,)
		var(--preview-content,)
	;
}
</style>

<figure>
	<div class="with-after" style="--preview: 100vw"></div>
	<div class="with-after">No preview. </div>
</figure>

```HTML
<div class="with-after" style="--preview: 100vw"></div>
<div class="with-after">No preview. </div>
```

There are a few things to note about the `content` part:

1. We can use the abovementioned `--preview-toggle` to conditionally add something only when the preview is present.

2. In this case, I did not set up things to work interchangeably when we set the `--preview` on the element itself or on the pseudo-element, so I did `--preview--toggle: inherit` to get its value from the element itself.

3. When we use the exposed values, we need not forget to add the comma for an empty fallback: `var(--preview-reset,)` and `var(--preview-content,)`, otherwise the IACVT value when the `--preview` is not defined could break the properties.

Finally, both `var(--preview-content,)` and `var(--preview-reset,)` could be used as is in their respective properties, but with importance, when we know for sure that we want to override whatever the default value there, is in the stylesheet while debugging things. The last [“inspector”](#inspector) use case is an example of this method.

## Use Cases

### Debugging

Well, this whole article is about this use case… I guess another way to demonstrate it would be to show how we can debug it[^self-debug] with itself:

[^self-debug]: I am a bit sad that I came up with this example _after_ I created this mixin and not _during_ — it would’ve helped me a lot with debugging itself! <!-- offset="1" span="2" -->

```CSS
.meta-test {
	--foo: 42.024px;
	--preview: var(--foo);
	--preview-position: var(--preview--before);

	&::after {
		--preview: var(--meta-preview);
		--preview-prefix: " (" var(--label) ": ";
		--preview-suffix: ")";
	}
}
```

<style>
	.meta-test {
		--foo: 42.024px;
		--preview: var(--foo);
		--preview-position: var(--preview--before);

		&::after {
			--preview: var(--meta-preview);
			--preview-prefix: " (" var(--label) ": ";
			--preview-suffix: ")";
		}
	}
</style>

<figure>
	<div
		class="meta-test"
		style="
			--meta-preview: var(--_p-part1);
			--label: 'before the dot'
		"
	></div>
	<div
		class="meta-test"
		style="
			--meta-preview: var(--_p-part2);
			--label: 'after the dot'
		"
	></div>
</figure>

```HTML
<div
	class="meta-test"
	style="
		--meta-preview: var(--_p-part1);
		--label: 'before the dot'
	"
></div>
<div
	class="meta-test"
	style="
		--meta-preview: var(--_p-part2);
		--label: 'after the dot'
	"
></div>
```

In this example, we first change the position where the result of the `--preview` is shown to be `::before`, and then set the `--preview` to be the inherited value of our `--meta-preview` variable on the `::after`, alongside the `--label` to format it nicely.


### Displaying Design Tokens

If you already have your design tokens as custom properties, then it might be pretty easy to display[^still-debugging] them with this mixin.

[^still-debugging]: Note that this is not intended to replace your design system: doing it with this mixin will mean it won’t be accessible, but that could be still useful for debugging and seeing all the values you’re working with when working on some experiments. <!-- offset="1" span="3" -->

Here are some of the colors I am using on this site:

<figure>
	<ul class="design-tokens">
		<li style="--preview: var(--PINK"></li>
		<li style="--preview: var(--GREEN"></li>
		<li style="--preview: var(--RED"></li>
		<li style="--preview: var(--THEME_LINK"></li>
		<li style="--preview: var(--THEME_VISITED"></li>
		<li style="--preview: var(--THEME_SELECTION"></li>
		<li style="--preview: var(--THEME_CODE"></li>
		<li style="--preview:     currentColor"></li>
	</ul>
</figure>

Here are some space toggles, and variables containing `1`/`0` values that I am setting for various conditional purposes, displaying their current state:

<figure>
	<ul class="design-tokens">
		<li style="--preview: var(--LIGHT"></li>
		<li style="--preview: var(--DARK"></li>
		<li style="--preview: var(--at-small-toggle"></li>
		<li style="--preview: var(--at-large-toggle"></li>
		<li style="--preview: var(--at-small"></li>
		<li style="--preview: var(--at-large"></li>
	</ul>
</figure>

And the computed values of some dimensions (in the source some of them are using `em` and `rem`, but without `string()` we can’t display the non-computed[^calc-em] value today):

[^calc-em]: If we knew in advance that we’re displaying a value in `em` or `rem`, we _could_ use them and divide the result by their value, but it is not possible to do so in a general sense. <!-- offset="2" span="2" -->

<figure>
	<ul class="design-tokens">
		<li style="--preview: var(--THEME_ROOT_FONT_SIZE"></li>
		<li style="--preview: var(--THEME_INDENT"></li>
		<li style="--preview: var(--THEME_FONT_SIZE"></li>
		<li style="--preview: var(--THEME_FONT_SIZE--SMALL"></li>
		<li style="--preview: var(--THEME_FONT_SIZE--CODE"></li>
		<li style="--preview: var(--THEME_LINE_HEIGHT"></li>
		<li style="--preview: var(--THEME_LINE_HEIGHT--SMALL"></li>
		<li style="--preview: var(--content-max-width"></li>
		<li style="--preview: var(--content-min-width"></li>
		<li style="--preview: var(--aside-width"></li>
		<li style="--preview: var(--viewport-padding"></li>
	</ul>
</figure>

The HTML to display this is simple:

```HTML
<ul class="design-tokens">
	<li style="--preview: var(--LIGHT"></li>
	<li style="--preview: var(--DARK"></li>
	<!-- and so on -->
</ul>
```

And most of this example’s CSS is handling anything _aside_ from the preview part that is only used inline:

<style>
.design-tokens {
	display: grid;
	gap: 0 1rem;
	grid: "a b" / auto 1fr;
	width: max-content;
	margin: 0 auto;
}
.design-tokens > li {
	display: grid;
	grid: 1fr / subgrid;
	grid-column-end: span 2;
	padding: 0;
	&::before {
		all: initial;
		font: inherit;
		content: attr(style);
		overflow: clip;
		text-indent: -15ch;
		white-space: pre;
		font-size: var(--THEME_FONT_SIZE--SMALL);
		font-family: var(--THEME_FONT_FAMILY_MONOSPACE);
	}
	&::after {
		outline: none;
	}
}
</style>

```CSS
.design-tokens {
	display: grid;
	gap: 0 1rem;
	grid: "a b" / auto 1fr;
	width: max-content;
	margin: 0 auto;
}
.design-tokens > li {
	display: grid;
	grid: 1fr / subgrid;
	grid-column-end: span 2;
	padding: 0;
	&::before {
		all: initial;
		font: inherit;
		content: attr(style);
		overflow: clip;
		text-indent: -15ch;
		white-space: pre;
		font-size: var(--THEME_FONT_SIZE--SMALL);
		font-family: var(--THEME_FONT_FAMILY_MONOSPACE);
	}
	&::after {
		outline: none;
	}
}
```

The most fun place here is probably using the `overflow` and negative `text-indent` to hide the first characters of the `::before`, as well as omitting the trailing `)` in the HTML for the variables. Also — subgrid.

### Inspector

This is not a very polished example, but a fun one: we can implement something similar to the browser’s inspector. Click on the checkbox below and see it in action! And don’t forget to move your cursor!

<figure>
	<input-value as=".has-inspector" root="html" to="body">
		<input-source>
		  <label><input type="checkbox" id="inspector" /> <span>Enable the Inspector</span></label>
		</input-source>
	</input-value>
</figure>

I know, it is a bit junky, but it works! In this case, we’re inspecting the value of `1em` on the hovered element, but we can put anything in the `--preview`.

Here is the code[^with-js] behind it:

[^with-js]: I am using JS to toggle the `.has-inspector`. <br /> Initially, I used `body:has(#inspector:checked)` here, but in older Chrome this led to a serious performance regression, so I had to change this. <!-- span="2" -->

```CSS
.has-inspector *:hover:not(:has(:hover)) {
  anchor-name: --inspected;

  outline: 2px solid hotpink;

  &::after {
    position: absolute;
    position-anchor: --inspected;
    left: anchor(inside);
    top: anchor(outside);
    z-index: 99;
    padding: 0.5em;
    color: #000;
    background: pink;
    --preview: 1em;
    --preview-prefix: "1em = ";
    pointer-events: none;
    text-indent: 0;
		counter-reset: var(--preview-reset) !important;
		content: var(--preview-content) !important;
  }
}
```

<style>
.has-inspector *:hover:not(:has(:hover)) {
  anchor-name: --inspected;

  outline: 2px solid hotpink;

  &::after {
    position: absolute;
    position-anchor: --inspected;
    left: anchor(inside);
    top: anchor(outside);
    z-index: 99;
    padding: 0.5em;
    color: #000;
    background: pink;
    --preview: 1em;
    --preview-prefix: "1em = ";
    pointer-events: none;
    text-indent: 0;
		counter-reset: var(--preview-reset) !important;
		content: var(--preview-content) !important;
  }
}
</style>

I am using anchor positioning here, but as a progressive enhancement: things should still work without it, just won’t be displayed as nicely.

## The Implementation and Techniques

There is a lot going on inside! I learned a lot while working on this mixin, especially about how the custom counter styles work.

- - -

The core of the mixin[^indirect-cyclic-conditions] is how we can use CSS counters to output strings. This is something I saw many people do already. One example that I vividly remember was from [Lea Verou](https://lea.verou.me/)’s [“CSS Variable Secrets”](https://youtu.be/ZuZizqDF4q8?si=aEft49zNFbbWqT-Q&t=2109) talk from [CSS Day 2022](https://cssday.nl/2022/) (which I attended), where she demonstrated how we can output a numeric value as a counter via `counter-reset`. For integers, it was as simple as setting the CSS counter directly, and for floats, she presented a trick that used a registered custom property that she attributed to [Ana Tudor](https://thebabydino.github.io/).

[^indirect-cyclic-conditions]: Aside from the [“Indirect Cyclic Conditions”](/indirect-cyclic-conditions/) — the technique that is used for applying this mixin. If you want to understand why and how we can apply some styles by simply defining a single custom property — that article will tell you all about it.

However, our mixin is so much more complicated!

1. We want to output the value not just as an integer (rounding it from the float), but with actual digits after the dot.

2. These digits must be _optional_ — if we have an integer, we don’t want to display the dot and the zeros after it.

3. The input could be not just a `<number>`, but any `<length>`, or even other dimensions like `<angle>`, `<time>`, or `<percentage>`.

4. Even more: if we receive a value that has some unit, we want to display that unit as well.

5. All of the above is just for dimension-like values — but we’d want to display even more things like space toggle values, some idents, strings, and colors.

I won’t go into the details of _every_ part of the implementation (I invite you to read the heavily commented [source code of the mixin](#the-mixin)), but I will try to distill the techniques that I used, and things you could take away even if you’re not planning on using the mixin itself.

### Conditional Counters Output

The core technique that I use is the custom [`@counter-style`](https://drafts.csswg.org/css-counter-styles/#the-counter-style-rule) rule with ranges and fallbacks.

Many parts of our mixin are _optional_: units can be present or not, the dot and the digits afterward can be present — or not, various idents can also be sometimes present, or we could want to display the `<empty>`, `<initial>`, or `<unknown>` strings.

We don’t have native conditions in CSS yet, so how can we handle all of this? The idea is to use many different counters, each with its own `@counter-style` which defines how it should look, combining the final string from multiple parts. A good example is how we show the dot and the digits after it.

First, we define our counters as a part of the `counter-reset` value, and then use them as a part of the `content`'s value:

```CSS
counter(--_p-sign,  --_p-sign)
counter(--_p-part1, --_p-as-number)
counter(--_p-dot,   --_p-has-dot)
counter(--_p-zero1, --_p-leading-zero)
counter(--_p-zero2, --_p-leading-zero)
counter(--_p-part2, --_p-has-decimals)
counter(--_p-part3, --_p-has-decimals)
```

As I said, I won’t go deep into the details, but the problem with the digits after the decimal separator is that we have to split our number into several parts to display it:

1. The sign.
2. The part _before_ the dot.
3. The optional dot itself.
4. The first potential leading zero after the dot.
5. The second potential zero.
6. The three digits after the dot, separated into two parts.

Note that I am limiting the precision to be up to 3 digits — otherwise the implementation could get even more complex, with more parts.

Why do we have to have these extra leading zeroes? Because we need to separate our decimal into two parts. Imagine we have a value like `0.001`. A single counter can only be an integer, so if we split the value into two numbers, it will be `0` and `001` — and the `001` will be displayed just as a `1`, so we have to separately check[^pad-but-not] if we need to display these zeros. See the math for splitting and detecting the zeroes in the full source code, but the interesting part is the custom counter styles — the second argument of the `counter()` function.

[^pad-but-not]: Potentially, we could use the `pad` descriptor of the `@counter-style` rule, but I did not find a good way to use it conditionally with different values, as it does not accept custom properties. <!-- offset="4" span="2" -->

Here are a few of them that are used for the counters above:

```CSS
@counter-style empty {
	system:  cyclic;
	symbols: "";
}
@counter-style --_p-sign {
	system:   cyclic;
	symbols: "-";
	range:    -1 -1;
	fallback: empty;
}
@counter-style --_p-as-number {
	system:  cyclic;
	symbols: "";
	range: 424242 424244;
}
@counter-style --_p-has-dot {
	system:   cyclic;
	symbols: ".";
	range:    1 infinite;
	fallback: empty;
}
@counter-style --_p-leading-zero {
	system:  cyclic;
	symbols: "";
	range:   1 infinite;
}
@counter-style --_p-has-decimals {
	system:  cyclic;
	symbols: "";
	range:   0 0;
}
```

There are four descriptors inside our `@counter-styles` rules that we need to talk about.

#### Cyclic Counter System

You probably noticed that all our counters have the `system: cyclic` there. There are many[^counter-systems] different [systems](https://drafts.csswg.org/css-counter-styles/#counter-style-system) that can be used for counters, but in our case we only care about the [`cyclic`](https://drafts.csswg.org/css-counter-styles/#cyclic-system) one, and we only use it with a single `symbols` value.

[^counter-systems]: I am a bit sad that I am using the most boring system possible here — there are so many interesting ones! For some examples, see the recent [“Some Things You Might Not Know About Custom Counter Styles”](https://css-tricks.com/some-things-you-might-not-know-about-custom-counter-styles/) article by [Geoff Graham](https://geoffgraham.me/). <!-- span="3" offset="1" -->

With this, we can completely replace the value of a counter with our `symbols` value.

#### Symbols: Empty or Not

In most cases, I am using this to _omit_ displaying some counter, where we can use `symbols: ““` — an empty string at certain conditions. And if we want to replace our counter with some string, we can provide the value to the [`symbols`](https://drafts.csswg.org/css-counter-styles/#counter-style-symbols), like for the dot — `”."` — or the minus sign — `"-"`.

#### The Conditions: `Range` Descriptor

The key for applying conditions is the [`range`](https://drafts.csswg.org/css-counter-styles/#counter-style-range) descriptor. It allows defining a range for which our counter style applies. We pass two integers inside, with an optional `infinite` keyword, and if the counter’s value is in this range, the style kicks in. Otherwise, the `fallback` will be applied. Some examples:

1. The `range` for our `--_p-sign` counter style is `-1 -1` — as the range is _inclusive_, when the counter value is precisely `-1`, it will output the `-` value. We could make it `infinite -1` instead, but because we’re using the result of the `sign()` function (or, actually, its workaround’s), the only values it will get are `1` and `-1`.

2. Both the `--_p-has-dot` and `--_p-leading-zero` have the `range: 1 infinite`. This means that as long as they’re not zero or negative, they will output their `symbols` value.

3. The `--_p-has-decimals` has the range of `0 0` and an absent `fallback`, meaning that when it is not a zero, it will output the counter with the default decimal counter style. Otherwise, it will omit it. This is useful for omitting the trailing zeros for values like `3.400` etc.

4. The `range` for the `--_p-as-number` is pretty special: `424242 424244` — we use these very specific integers for other counters.

#### The Fallback

The only [`fallback`](https://drafts.csswg.org/css-counter-styles/#counter-style-fallback) that we use is the `empty` counter style that we also define. If the fallback is omitted, the default `decimal` built-in counter style will be used.

### Detecting the Dimension-like Types

Another big aspect of how the mixin works is detecting and working with various `<dimension>`-like types, and not only `<number>`s. It is a multi-step process, not too complicated, but with many nuances.

#### Capturing the Dimension-like Value

The first step that we need to do: is attempt to [“capture”](https://blog.kizu.dev/captured-custom-properties/) the value of the `--preview` variable, casting it as a `<dimension>`-like[^not-dimension] type.

[^not-dimension]: I thought about using the CSS [`<dimension>`](https://drafts.csswg.org/css-values/#dimensions) type itself, but decided against it, as I would need to then also handle the `<frequency>`, `<resolution>`, and who knows what in the future. <!-- span="3" offset="1" -->

To do it, we first register a custom property:

```CSS
@property --_p-captured {
	syntax:
		"<number>|<length>|<angle>|<time>|<percentage>";
	initial-value: 424243;
	inherits:      false;
}
```

And then assign the `--preview` to it, though via a `calc()`:

```CSS
--_p-captured: calc(var(--preview));
```

A few things to note here:

1. The `initial-value` here is something I mentioned in the [“The Conditions: `Range` Descriptor”](#the-conditions-range-descriptor) section — it is used as a way to detect any non-parsed value as if the value couldn’t be cast as our `syntax`, we will get our `initial-value` as the fallback.

2. For all registered custom properties in the mixin, I am using `inherits: false`. This is not strictly necessary, as by defining the mixin as `*, *::before, *::after` we break the inheritance anyway, but this way it is more explicit, but it could be interesting to know if there would be any performance difference between these options.

3. When assigning the `--preview`, we wrap it with `calc()` — this allows us to preview incomplete calculated values. With custom properties, it is possible to pass around things like `2 + 2`, but a sequence like this cannot be assigned to a property that expects a `<dimension>` _unless_ we wrap it with a `calc()`.

#### Extracting Units: `tan(atan2())`

After we capture the value, we can attempt extracting the units from that value.

We need two things:

1. Get the value as a `<number>`, without its unit.

2. Keep the information about which type the value was before we stripped the unit.

We can achieve both by using the [“CSS Type Casting to Numeric: tan(atan2()) Scalars”](https://www.bitovi.com/blog/css-only-type-grinding-casting-tokens-into-useful-values) technique by [Jane Ori](https://propjockey.io/about/) several times — once for each type, — and do so while assigning the resulting value to a number of registered custom properties:

```CSS
@property --_p-from-number {
	syntax:       "<number>";
	initial-value: 0;
	inherits:      false;
}
@property --_p-from-length {
	syntax:       "<number>";
	initial-value: 0;
	inherits:      false;
}
@property --_p-from-angle {
	syntax:       "<number>";
	initial-value: 0;
	inherits:      false;
}
@property --_p-from-time {
	syntax:       "<number>";
	initial-value: 0;
	inherits:      false;
}
@property --_p-from-percentage {
	syntax:       "<number>";
	initial-value: 0;
	inherits:      false;
}
```

They all have the same[^why-not-merge] `syntax` and other descriptors, but this allows us to get multiple custom properties where the one that will receive some value will, well, have this value, and the rest will be just equal to `0`. Here is how we will assign all the values:

[^why-not-merge]: I wish we could define multiple custom properties of the same type at the same time, like `@property --_p-from-number, --_p-from-length {}`… <!-- span="2" -->

```CSS
--_p-from-number: var(--_p-captured);

--_p-from-length: calc(
	10000
	*
	tan(atan2(var(--_p-captured), 10000px))
);

--_p-from-angle: calc(
	10000
	*
	tan(atan2(var(--_p-captured), 10000deg))
);

--_p-from-time: calc(
	10000000
	*
	tan(atan2(var(--_p-captured), 10000s))
);

--_p-from-percentage: calc(
	10000
	*
	tan(atan2(var(--_p-captured), 10000%))
);
```

Again, a few nuances worth mentioning:

1. The `--_p-from-number` is the simplest one: we just make sure it will be either a `<number>` or `0`, no need to do anything extra.

2. For the rest, we’re using `tan(atan2())` method, where we are using our captured value as the first argument of `atan2()`, and then use a value with the desired unit we’re testing it against as the second argument. If both parts are correct and their types match, the calculation will be evaluated and captured. Otherwise, it will see a type mismatch and fall back to the property’s initial value — `0`.

3. You might ask why we have the `calc(10000 * …)` and use a high value as the second argument for the `atan2()` — this is a workaround for a [Firefox bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1939353) that I stumbled upon when testing the mixin. Without doing this, there might be a loss in precision when applying `tan(atan2())`.

4. By default, when using registered properties with the type `<time>`, their value is assigned in seconds. However, I prefer to work with `ms` instead, so we had to adjust the calculation a bit.

#### Merging Values Together

Now that we have that array of numbers, we can “merge” it:

```CSS
--_p-value: (
	var(--_p-from-length)
	+
	var(--_p-from-number)
	+
	var(--_p-from-angle)
	+
	var(--_p-from-time)
	+
	var(--_p-from-percentage)
);
```

Because all these custom properties are of different types, and have either some captured value or a `0`, we can just add all of them together and get the final value as a `<number>`.

#### Getting the Absolute Value & the Sign

Because of how we separate the number into two parts, I found it much more convenient to work with an absolute version of our value. Alongside it, we can extract the “sign”, which we will be using for a few things in the future.

We don’t have `abs()` and `sign()` in CSS yet in a cross-browser way ([Chrome, hello?!](https://issues.chromium.org/issues/40253181)), but it is not too difficult to get them through the available math[^abs-sign]:

[^abs-sign]: I recommend reading a [“Using Absolute Value, Sign, Rounding and Modulo in CSS Today”](https://css-tricks.com/using-absolute-value-sign-rounding-and-modulo-in-css-today/) article by [Ana Tudor](https://thebabydino.github.io/) about these workarounds. <!-- offset="2" span="2" -->

```CSS
--_p-value-abs:
	max(var(--_p-value), -1 * var(--_p-value));

--_p-sign:
	calc(var(--_p-value) / var(--_p-value-abs));

```

#### Handling Floats and Rounding Issues

I won’t go into the details of how I get all the variables necessary for displaying the part after the dot, but there are a few nuances I wanted to mention which can be seen in the first calculation where we get the `<integer>` part of our value:

```CSS
--_p-part1:
	round(down, var(--_p-value-abs) + 0.0001, 1);
```

1. We need to round _down_, as that part should stay unchanged.

2. We have to add the `0.0001` — a workaround for a [Firefox rounding bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1924363). The bug is currently fixed, but I kept the workaround just in case. Note that this value should be smaller than the precision we’re working with: in my mixin, I am limiting the precision to 3 digits after the dot, so this value should be `pow(10, -4)`.

3. The `1` at the end of `round()` could be potentially omitted, but Safari did only recently implement the more recent change to the spec that allows to omit it for `<number>` values, so it is better to keep it for better browser compatibility.

#### Using Counters For Units

This is a part where having several different custom properties per accepted `<dimension>`-like type is very handy: we can have as many counters, each of which will have our custom `empty` counter style when the value is a zero, and will output the desired unit otherwise.

First, we need to assign the counter values in the value for the `counter-reset`:

```CSS
--_p-unit-px round(
	up,
	var(--_p-from-length) * var(--_p-sign),
	1
)
--_p-unit-deg round(
	up,
	var(--_p-from-angle) * var(--_p-sign),
	1
)
--_p-unit-ms round(
	up,
	var(--_p-from-time) * var(--_p-sign),
	1
)
--_p-unit-perc round(
	up,
	var(--_p-from-percentage) * var(--_p-sign),
	1
)
```

We need to have an integer here, and for this, we have to round it up. Although, actually, the values in these properties can be negative! And, while we have a `to-zero` keyword for `round()`, we do not have a `from-zero` alternative, for some reason. So, we have to first make the value absolute. And, because we already did this in the past and got a sign from it, we can do a simpler workaround compared to the `max()` one, and just multiply each value by its sign!

Applying counters in the `content` is trivial[^same-idents]:

[^same-idents]: You can also see a pattern that I often use: naming two custom idents for different types with the same name. <!-- span="2" -->

```CSS
counter(--_p-unit-px,   --_p-unit-px)
counter(--_p-unit-deg,  --_p-unit-deg)
counter(--_p-unit-ms,   --_p-unit-ms)
counter(--_p-unit-perc, --_p-unit-perc)
```

And the custom `@counter-style`s for these are very straightforward:

```CSS
@counter-style --_p-unit-px {
	system:   cyclic;
	symbols: "px";
	range:    1 infinite;
	fallback: empty;
}
@counter-style --_p-unit-deg {
	system:   cyclic;
	symbols: "deg";
	range:    1 infinite;
	fallback: empty;
}
@counter-style --_p-unit-ms {
	system:   cyclic;
	symbols: "ms";
	range:    1 infinite;
	fallback: empty;
}
@counter-style --_p-unit-perc {
	system:   cyclic;
	symbols: "%";
	range:    1 infinite;
	fallback: empty;
}
```

Having only positive numbers here is useful, as we can have just one range. Otherwise, we would have to use two of them:

```CSS
range: infinite -1, 1 infinite;
```

### Detecting Space Toggles

_Of course_, I would want to be able to display the values of space and cyclic toggles! After all, this technique is only possible because of them.

This was a rather simple thing to do, but with its minor nuances. We need to first register two custom properties:

```CSS
@property --_p-is-empty {
	syntax:       "<number>";
	initial-value: 0;
	inherits:      false;
}

@property --_p-is-initial {
	syntax:       "<number>";
	initial-value: 0;
	inherits:      false;
}
```

And then assign `--preview` to them with a few bells and whistles:

```CSS
--_p-is-empty: 1 var(--preview);

--_p-is-initial:
	calc(1 - var(--_p-is-empty)) var(--preview,);
```

First, we can easily test if our value is empty by trying to assign the `--preview` to it alongside a `1` value: if the value _is_ empty, the result will be just a `1`, and will fall back to `0` otherwise.

Then, we do a similar thing with the custom property that tests for the `initial` value: we use a `var(--preview,)`, which will fall back to an empty value if the `--preview` is IACVT, and will be some other value otherwise. Because it _can_ also be empty, this could result in a false positive, but as we already know if the value is empty, we can use this and adjust the value accordingly.

### Detecting Strings

Curiously, before this step we did not encounter _type grinding_, which you could be familiar with from the [“CSS-Only Type Grinding: Casting Tokens (sm|md|etc) into Useful Values”](https://www.bitovi.com/blog/css-only-type-grinding-casting-tokens-into-useful-values) article by [Jane Ori](https://propjockey.io/about/). Now, it is time!

First, registering custom properties that will be used for this:

```CSS
@property --_p-is-string-or-0 {
	syntax:       "<string>+|<number>";
	initial-value: 0;
	inherits:      false;
}
@property --_p-is-string {
	syntax:       "<number>";
	initial-value: 1;
	inherits:      false;
}
```

And then assigning them:

```CSS
--_p-is-string-or-0: var(--preview) "";
--_p-is-string:
	var(--_p-has-strings, var(--_p-is-string-or-0))
	var(--_p-no-strings, 0);
```

A few notes:

1. With counters, we can accept not just a single string, but [multiple of them](https://drafts.css-houdini.org/css-properties-values-api/#multipliers): `"<string>+"`. While we couldn’t display them too nicely, it is better than the alternative.

2. We need to have a `<number>` in the `syntax` so we could fall back to `0` when the value is _not_ a string. But what if the `--preview` would be itself a `<number>`, like a `0`? We can exclude it by assigning the `var(--preview) ""` — with an additional empty string! This will be valid if the other part is also a string (or multiple of them), but won’t be valid for any other combination.

3. After the first step, if the value is a string, the result will be a string as well. Otherwise, it will be `0`. That’s where the second step comes into play, where we assign `--_p-is-string` which has an `initial-value: 1`. It will accept the valid `0` when the `--preview` is not a string, and will fall back to `1` when it is one!

4. We need to use space toggles `--_p-has-strings` and `--_p-no-strings` to properly handle the `@property` with `<string>` support, as it is only available in Safari starting from [18.2](https://webkit.org/blog/16301/webkit-features-in-safari-18-2/#and-more-css).

Now, we are not actually using this variable for counters — we’re not using them at all for displaying strings, as, well, `content` already accepts them!

So the only thing we will need to do is register a custom property that will fall back to an empty string:

```CSS
@property --_p-as-string {
	syntax:       "<string>+";
	initial-value: "";
	inherits:      false;
}
```

Then assign it:

```CSS
--_p-as-string: var(--preview);
```

And use while wrapping it with a space toggle, as otherwise it will break everything if the `<string>` type is not supported:

```CSS
counter(--_p-quote, --_p-quote)
var(--_p-has-strings, var(--_p-as-string))
counter(--_p-quote, --_p-quote)
```

Speaking of these space toggles, here is how we can detect if `<string>` is supported:

```CSS
body {
	--_p-has-strings: ;
	--_p-no-strings: initial;
}
@container style(--_p-as-string: "") {
	body {
		--_p-has-strings: initial;
		--_p-no-strings: ;
	}
}
```

By default, we set space toggles that say “No `<string>` support”. Then, because the version of Safari that supports it also already have a container style queries support, we can use the already registered `--_p-as-string`, and test if the value that will be present on the `html` element is the one we did set via an `@property`, and switch the space toggles if so.

The only problem with using container style queries for this: Firefox does not understand them yet, so even though it supports `<string>` in `@property`, it would display strings as `<unknown>`. This is better than nothing working in older Safari, but I will explore other workarounds that won’t have this downside.

- - -

While we can just output the `--_p-as-string` as is, we still need to have our custom counter-styles if we want to add quote symbols around our string. This is where our string detection will be handy, as we could use it for the counter value:

```CSS
--_p-quote max(
	0,
	var(--_p-is-string) - var(--_p-is-empty)
)
```

Similar to how we did it when [detecting space toggles](#detecting-space-toggles), an empty value can result in a false-positive `--_p-is-string`, so we need to subtract the `--_p-is-empty` to accommodate for this (and use the `max()` to only have `0` and `1` as possible values).

The `@counter-style` is nothing special:

```CSS
@counter-style --_p-quote {
	system:   cyclic;
	symbols: "'";
	range:    1 1;
	fallback: empty;
}
```

### Detecting Idents

As I already mentioned in the [“Adding Idents”](#adding-idents) section, for displaying idents we’re using counter styles… but how do we detect them? You might remember that we [could register](#adding-idents) the `--known-ident` custom property to provide additional idents, but how will those built-in work alongside it? It is a lot of “type grinding”:

```CSS
--known-ident:        var(--preview);
--_p-is-1-if-known:   var(--known-ident);
--_p-is-known:        var(--_p-is-1-if-known);

--_p-builtin-ident:   var(--preview);
--_p-is-1-if-builtin: var(--_p-builtin-ident);
--_p-is-builtin:      var(--_p-is-1-if-builtin);

--_p-is-custom-ident: var(--preview);
--_p-is-none-or-0:    var(--_p-is-custom-ident);
--_p-is-none:         var(--_p-is-none-or-0);
```

I won’t dig into how these work, but, essentially, we have to do three things:

1. Check if the value is a “known” ident — the one that we allow overriding as the public API of our mixin.

2. Check if the value is `none` — we have to handle this value separately, as it is not possible to have a `@counter-style` with this name.

3. Check if the value is one of the idents that we defined as built-in.

These are output in the `content` this way:

```CSS
counter(_, var(--known-ident))
counter(_, var(--_p-builtin-ident))
counter(--_p-is-none, --_p-is-none)
```

Only the `none` value is using our pre-defined counter-style, and the known and built-in idents rely on the fact that we can use other idents as names for `@counter-style`.

Fun fact: we don’t care which counters we’re using for the known and built-in idents, as we are not using the counter’s value in any way, so we can just use any counter name, as it will fall back to `0` if not defined anywhere.

### Detecting Colors

Sadly, currently, there is no way to get the value of a color as a string, but what we can do is apply the color to our pseudo-element. This is something that I will probably iterate more in the later versions of the mixin. I mostly want to work on how the color is actually displayed, but the way we detect it will stay the same.

Again a bit of type grinding:

```CSS
--_p-is-color-or-0:
	color-mix(in hsl, var(--preview) 100%, red 0%);
--_p-is-color: var(--_p-is-color-or-0);
```

Similar to a few other places, we can use a function — `color-mix()` — that can only accept a color for the `--preview`, and output `0` otherwise.

I will omit how the color is applied — as I mentioned, I will likely rework this place in the future.

### Detecting Numbers

Wait, didn’t we do this when we [detected the dimension-like types](#detecting-the-dimension-like-types)? Not exactly! Remember all these cases where we had fallbacks to the “special” values like `424242`? Now that we detected all other types, we can check if our value is actually a number — or some other type.

First, we define a custom property that will use some other detected custom properties to exclude other types:

```CSS
--_p-is-number: max(
	0,
	1
	-
	var(--_p-is-string)
	-
	var(--_p-is-empty)
	-
	var(--_p-is-initial)
);
```

We start from `1`, and then if we detect a string, empty, or IACVT, we get the `0` as the result[^just-calc].

[^just-calc]: In theory, we could just use `calc()` as these _should be_ mutually exclusive, but I used `max()` just in case. <!-- offset="1" span="2" -->

This value is then used for a bit more complex calculation of the first part of the number in the counter value, where we will also need to account for some other types — and also handle our “special” values like `424242`:

```CSS
--_p-part1 calc(
	var(--_p-part1) * var(--_p-is-number)
	+
	424242 * (1 - var(--_p-is-number))
	+
	var(--_p-is-builtin)
	+
	var(--_p-is-known)
	+
	var(--_p-is-none)
	+
	var(--_p-is-color)
)
```

Again, I won’t go into more detail about how it works: there is nothing special there.

## The Bugs Roundup

When I compiled the result of [My 2024 in CSS](https://blog.kizu.dev/my-2024-in-css/), I calculated that, on average, I reported a bit more than 2 bugs per month for the past two years.

I started working on this mixin — and its article — at the end of December, right after finishing my [“Indirect Cyclic Conditions: Prototyping Parametrized CSS Mixins”](/indirect-cyclic-conditions/) article. I ended up finding and reporting a few bugs related to what I was doing:

- [“`tan(atan2())` results in incorrect values compared to Chrome and Safari”](https://bugzilla.mozilla.org/show_bug.cgi?id=1939353) (Firefox)

- [“Counter is not reset when using a registered custom property”](https://bugzilla.mozilla.org/show_bug.cgi?id=1939352) (Firefox) — this one ended up being a duplicate of the previous one.

- [“Dashed idents are not allowed in the syntax of registered custom properties”](https://bugzilla.mozilla.org/show_bug.cgi?id=1939501) (Firefox)

- [“Dashed idents are not allowed in the syntax of registered custom properties”](https://issues.chromium.org/issues/386671303) (Chrome)

- [“An out-of-flow element in phrasing content introduces a soft-wrap opportunity and breaks browser search”](https://issues.chromium.org/issues/40658609) (Chrome) — not my report, but I found it when trying to report the issue I encountered. This issue was not active for 5 years, so I added a comment with my test case.

This shows how exploring these complex use cases helps to identify various issues.

## Final Words

That was a lot! Originally, I wanted to just try my new technique and create a simple mixin… Create I did, but fell in a rather deep rabbit hole, and now invited you inside as well.

Please [try this mixin](https://github.com/kizu/mixins) the next time you do some experiments involving complex calculations, and let me know if it was of any help.

And even if not, I hope you will retain some of the small techniques I showcased in this article, like how the `@counter-style` works, or the ways we can understand the types of some dimensions.

As it often goes with my experimental articles: by proving that something is possible _in a hacky way_, I hope to prove authors’ interest and implementation possibility, and unlock further experiments based on my results. If you think all of this is overcomplicated — it is! So let’s hope — and encourage browser developers — that something like this will be possible natively in the future, with as simple CSS as just wrapping your values in `string()`.
