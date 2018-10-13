# Keyboard-Only Focus

#Practical #Accessibility #Bugs #CSS #HTML

_After playing a lot with HTML & CSS, I present you with a very robust and practical solution to one of the most annoying problems: keyboard-only focus on interactive elements. All thanks to `tabindex` in HTML and almost to no CSS._

One of the things I couldn't manage to find a solution for a long time was a problem of focus styles on interactive elements. The problem was: when you have an element with some `:focus` styles, they're applied not only to the focused state itself but also after you just click on this element (and it behaves differently for different elements in different browsers, of course).

What this meant is that whenever you wanted to have some custom element, you would need to compromise in how the focus state would look like, because if you'd make it too bright or distinct from the normal state, users would see it whenever they'd click the elements with those styles. So you're either getting the too noticeable effect when it is not needed or not enough noticeable effect when it is needed. Accessibility-wise, the former is, of course, better, but what if we could make those styles not to apply when you click at all?

In this post, I'll present to you the solution[^solution] I had found. It is not perfect, but I think this is enough for us to start making our elements both having a distinct bright focus state and be good looking when users would use a mouse, a trackpad etc.

[^solution]: You can jump straight to [the final solution](#proper-solution), but I recommend you to read the whole post anyway in order to better understand it.

## Current State of the Problem

To understand the problem better, we should look at how things behave in different browsers for the simplest test case.

Try to hover, click and switch focus over those controls:

{{<Partial src="examples/1.html" />}}

Browsers behave a bit differently there:

### Which Browsers Get the Focus Ring After Click

| Browser     | Button | Link         | Span |
|:----------- |--------|--------------|------|
| Chrome      | Yes    | Yes          | Yes  |
| Edge        | Yes    | Yes          | Yes  |
| Firefox Win | Yes    | Yes          | Yes  |
| Firefox Mac | **No** | Yes          | Yes  |
| Safari      | **No** | Yes[^safari] | Yes  |

[^safari]: Note that the Safari doesn't get keyboard focus for links by default (you need to enable it in its preferences for this), but still gets the state on click. <!-- align="end" -->

We can already see that for most elements in all browsers we would get that focused state when we'd click our custom element, while for the `<button>`s in Safari and Firefox for Mac we won't.

## Possible Solution in the Specs?

One thing we should always do when we start experimenting is to see if there is already a solution in current or incoming specifications.

[The latest draft of Selectors Level 4](https://drafts.csswg.org/selectors-4/#the-focusring-pseudo) provides us with two new focus-related pseudo-classes: `focus-within` and `focus-ring`.

- `:focus-within` is essentially a `:focus` that works like `:hover` — whenever children of an element would get `:focus`, the element would get `:focus-within` (and the element would get it when focused itself, of course). I can see how that would be a really useful tool in future, but for our case it's rather useless (unless we'd try to do some really wild things).
- `:focus-ring` seems like a tool made specifically for our use-case — it is kinda the old `:focus`, but with this added: <q>[…] and the UA determines via heuristics that the focus should be specially indicated on the element</q>.

In theory, `:focus-ring` should help us[^although]: we could use it for keyboard focus styles while leaving the normal `:focus` without anything excess. But there are two problems: no browser, as far as I know, supports the property from the spec and only Firefox supports its `:-moz-focusring` — [old proprietary pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:-moz-focusring), which was a base for a new one. And this pseudo-class is already a bit flawed:

[^although]: Of course, we'd need to implement it using progressive enhancement: declaring all the styles for `:focus`, then removing the styles on `:not(:focus-ring)`, as otherwise, we would lose in keyboard accessibility at older browsers.

{{<Partial src="examples/2.html" />}}

If you'd look at this example in Firefox, you could see two different issues:

1. At Firefox for Mac it would work properly unless you'd click on a styled span, in which case you'll see the focus-ring. That's unfortunate, as while for proper native controls things are ok, I'm sure there would be cases when people would like to have this kind of control over interactive parts of pages that should have the same behavior as the native controls. But as things are work as intended at Windows, maybe that behavior at Mac is a bug? Probably we could see it fixed in future.
2. This issue is bigger and worse — as [Patrick has mentioned](https://twitter.com/patrick_h_lauke/status/879808288669433857), there is a really weird heuristic which makes the `:-moz-focusring` to apply all-the-time once you've used a keyboard navigation on page at least once. That makes this solution not stable enough. Especially, given that in some cases I managed to “break” Firefox making it to consider **every** page to be in this keyboard-navigation always-on from the start and on refresh, which was fixed only after the browser restart.

In other browsers, you shouldn't see anything there unless someone would already implement the `:focus-ring`. If that would happen — tell me and I'll update this post!

## My Initial Solution

I was playing with one of my favorite CSS properties — `visibility` — when I had my “bingo” moment. After validating my idea and seeing it work I was really surprised I didn't come to this solution before. After some testing[^nope], I found out that not everything is so smooth, but more on this later.

[^nope]: Apparently, I didn't test enough. As [Ian](https://twitter.com/iandevlin) [pointed out](https://twitter.com/iandevlin/status/879796311566012416) after I initially published this post, I didn't test the solution enough at Firefox for Windows. That meant two things: at Windows  the `<button>` still had the focusring visible, and I didn't know about the heuristic of the `:-moz-focusring` that made the button with my solution completely unusable after user would use keyboard for at least once. I leave this solution to show what could be done if not for Firefox, and invite you to look at the [final proper solution](#proper-solution) below. <!-- span="4" offset="3" -->

### Visibility

I think this property deserves its own separate article just to show all the things you can do with it. But for now I'll briefly tell which its features would be really useful for our case:

1. Whenever you have an element with `visibility: hidden`, you can use `visibility: visible` on its children to make them visible.
2. Whenever you hide an element using `visibility: hidden`, it would not only become visually invisible (like with `opacity`), but it wouldn't also get keyboard focus and wouldn't be visible to assistive technologies. You can guess that the part about the keyboard focus is what interests us there.

You could already see where all of this leads us to: what if we'll add another element inside our interactive element, then use `visibility: hidden` on the element itself, but then return its contents back with `visibility: visible`?

The answer: the element would become accessible only using pointing-and-clicking devices, as clicking on the insides of a hidden element still triggers all the events on it. Of course, that's not exactly what we need, as we actually need the keyboard focus and don't want to lose in accessibility in any way.

### When to Hide

But then I was wondering: what if we would use this method of hiding-and-showing only when the pointer device is used? The pseudo-classes `:hover` and `:active` come to mind.

- If we'd use `:hover` there, everything would work almost as we would intend, but there would be a small issue of when we'd hover an element, and then we'd want to use keyboard navigation,  we couldn't get a focus on this element.
- If we'd use `:active`, then things would almost work, but the problem would be that when you call an action on an interactive element using a keyboard, then some browsers actually apply `:active` state on this element. The action would pass, but at the same time, we'll lose the focused state on the element.

After playing a bit with different combinations, the most logical way would be to use both states: `:hover:active`. Unless we interact with an element with something that is actually pointing it we won't trigger this state. With it, our solution would look like this:

``` CSS
.Button:active:hover {
  visibility: hidden;
}

:active:hover > .Button-Content {
  visibility: visible;
}
```

Of course, in that case, we'd need to move all the visual styling of the button to the inner element, and use the parent element only for layout.

And then when we'd need to declare all the states like `:hover`, `:active` and `:focus`, we'd need to do them using selectors[^itsok] like `:focus > .Button-Content`.

[^itsok]: Note that we don't need to add the parent's element class to the state when it is used like that — there are no performance issues due to how the selector matching works in browsers. <!-- offset="1" span="3" -->

Here, look at this example (better not in Firefox for now):

{{<Partial src="examples/3.html" />}}

We're almost there! If you'd look at this example in Chrome or Edge, everything would work perfectly: when you'd click those buttons, they would work and won't become visibly focused, but you would still be able to focus them from the keyboard and see the focus ring.

However, there are a few issues in other browsers: Safari and Firefox. In Safari the first button (the one that is made using `<button>`) would suddenly have the focus state clipped as if the parent button had `overflow: hidden` (while this is not the case). This is easily fixed by adding `position: relative` on the inner element which somehow fixes [this bug](https://bugs.webkit.org/show_bug.cgi?id=173872).

But in Firefox… Well, our `:hover:active` stuff just doesn't work. And even more to it, if we'd actually listen to the button's events, then on `<button>` we won't get[^fxbug] a `click` when we click (and that should be a _click_, not a tap!). That only happens when you change the `visibility` of a `<button>` on the `:active` state.

[^fxbug]: I suspect that there is [a related bug in bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1375877) for this, but maybe there are others, feel free to find if some other bug fits better! <!-- offset="2" span="2" -->

### Fixing Firefox

**Update from 28 June 2017:** At the time of writing this part I didn't test things in Firefox for Win. After testing it there I found out that this solution is completely unusable due to various problems in Firefox for Windows' implementation of buttons. **Do not use this fix**.

After spending a lot of time on trying to find a fix for Firefox, the best fix I could find was this:

- The `<button>` itself actually worked as intended always in Firefox, so we don't need to do anything for it.

    So, only for Firefox, we'd need to restore its visibility for the active state:

    ``` CSS
    button.Button:active:not(:-moz-focusring) {
      visibility: inherit;
    }
    ```

    Two things to note there:

    1. We're restoring the `visibility` using `inherit`, as in all cases when you need to **restore** the `visibility` it's better to use `inherit` instead of `visible`, because otherwise inside a `visibility: hidden` context we would suddenly make our element visible. In our case, it doesn't matter much, but it's just a good practice to get used to.
    2. For applying styles just for Firefox I'm using the pseudo-class that only Fx understands — `:-moz-focusring`, wrapping it with `:not()` as that's the case when we'd want it to work.

- For interactive links, spans and other non-button elements we'd need to use our method on `:hover`, which is not ideal as I mentioned before, but what can we do? At least, we can add an extra guard not to hide elements on hover when they're already focused. And we'd also use the same `:not(:-moz-focusring)` hack, and it even would make some sense there!

    ``` CSS
    .Button:not(button):hover:not(:focus):not(:-moz-focusring) {
      visibility: hidden;
    }

    :not(button):hover:not(:focus):not(:-moz-focusring) > .Button-Content {
      visibility: visible;
    }
    ```

    Note that we do this not for buttons, as adding this stuff for them on hover would make them flicker, and we already have native buttons in Fx to behave like we want them to.

### Final Initial Solution

With all those fixes, our example would look like this and should work the same in all modern browsers:

{{<Partial src="examples/4.html" />}}

But not that fast. In Firefox for Windows there are severe problems with buttons' implementation which lead to this solution being unusable. Thanks for [Ian Devlin](@iandevlin) for pointing this out. In Firefox for Windows you still would see the focus ring over the `<button>` there on click, and after you'd use keyboard navigation at least once, things would go completely wrong — Firefox would treat each `:focus` as if it has `:-moz-focusring`, which would be multiplied by another problem with buttons which would lead to `<button>` not to register clicks.

You can see how this initial solution worked on [this CodePen pen](https://codepen.io/kizu/pen/dRZzyP?editors=1100), without any extra styling (except for `all: initial` on buttons).

## Proper Solution

After writing and publishing this article, and then finding out the actual solution just don't work in Firefox for Windows (and not just not work — in some conditions it makes the buttons inaccessible), I've tried to find a proper solution. And, I think, I found it! Still not ideal at Firefox for Windows, but without those severe problems. I hope.

The solution came after watching [this video by Rob Dobson](https://www.youtube.com/watch?v=Pe0Ce1WtnUM) that [Vadim Makeev](@pepelsbey_) had suggested to me and reading [this article about tabindex](https://www.sitepoint.com/when-do-elements-take-the-focus/) that was suggested by [Patrick H. Lauke](@patrick_h_lauke).

Look at it:

{{<Partial src="examples/5.html" />}}

If should work everywhere _except_ for one case: only in Firefox for Windows after you'll use keyboard navigation at least once, you'll see focus ring after clicking on the `<button>` element. Maybe it is possible to fix this case, but its not critical[^ihatefx].

[^ihatefx]: Everything would work properly except for the visual focus ring even in this case, not like with the previous solution, and its the Firefox that should start with fixing its own problems with the `<button>`, not us finding hacky workarounds for them. <!-- offset="3" span="3" -->

The fun thing: this solution is even simpler than the previous one.

1. We're just adding a `tabindex="-1"` to the inner element, which makes all browsers to set actual focus not on the interactive element itself, but on its insides. And when an element has focus inside of it, all the keyboard events would still work properly, so you could “click” this button from keyboard without any problems. This is possible due to how browsers handle that negative tabindex — they don't put elements with it to the keyboard focus list, but make it possible to focus those elements by clicking on them or by setting focus programmatically.
2. The only place where this fix doesn't work is Firefox for Windows. There, only for a `<button>` element, you would still see the focus ring. I've fixed it using the `:-moz-focusring` by removing the focus styles when we don't need them. Of course, due to Firefox' strange heuristic, after you'll use keyboard navigation at least once, you'll then see this focusring on click, but that's a minor drawback and everything would still work otherwise.

Here is an HTML similar[^similar] to the one used for this solution:

[^similar]: Here and in the later CSS example I used more simplified classnames and overall changed things a bit for them to be more readable, as well as not mentioning all the reset and visual styles for our buttons. <!-- span="2" -->

``` HTML
<button class="Button" type="button" tabindex="0">
  <span class="Button-Content" tabindex="-1">
    I'm a button!
  </span>
</button>

<a class="Button" href="#x" tabindex="0">
  <span class="Button-Content" tabindex="-1">
    I'm a link!
  </span>
</a>

<span class="Button" tabindex="0">
  <span class="Button-Content" tabindex="-1">
    I'm a span!
  </span>
</span>
```

And here is the final CSS[^codepen] for our method:

[^codepen]: You can see how it works with this literal CSS on [this CodePen pen](https://codepen.io/kizu/pen/OgzMeQ?editors=1100), without any extra styling (except for `all: initial` on buttons). <!-- span="2" -->

``` CSS
/* Fixing the Safari bug for `<button>`s overflow */
.Button-Content {
  position: relative;
}

/* All the states on the inner element */
:hover > .Button-Content {
  background: blue;
}

:active > .Button-Content {
  background: darkorange;
}

:focus > .Button-Content {
  box-shadow: 0 0 3px 7px lime;
}

/* Removing the focus ring styles specifically for button in Firefox */
button:not(:-moz-focusring):focus > .ComplexButton-Content {
  box-shadow: none;
}

/* Removing default outline only after we've added our custom one */
.Button:focus,
.Button-Content:focus {
  outline: none;
}
```

Note that while the parent element is not hidden at any moment unlike at the previous solution with `visibility`, it is still better to have all the styles for our element on the inner element due to various reasons.

As an added bonus, if we'd want, we can now choose how we'd want to have our element when focusing it programmatically: we can have a visual focus by focusing an outer element, or we can choose not to have focus by focusing the inner element. Even more to it: if we'd add another inner element with the `tabindex="-1"`, then we could style element differently now in three cases: on keyboard focus, on click focus and on programmatic focus.

### Remaining Problems

- In Firefox for Windows after using the keyboard navigation at least once we would see the focus ring over the `<button>` elements. That's unfortunate, but it doesn't break the functionality and should be a rather rare and minor case.
- in IE11 the solution would work for links and other elements, but you'll always see the focus ring for `<button>`.
- This method needs an extra element and won't work for `<input type="button">` obviously (which I don't recommend using for buttons anyway) and there is literally nothing bad in adding an extra span when it helps us to fix a problem. Extra divs and spans are not not semantic.

So, not a lot of problems after all. If you'll see anything in the final example in the browser you use, let me know!

## Final Words

Now we can use a nice and noticeable keyboard focus state for our interactive elements without compromising in how it would look for others. That's the thing I tried to fix for years and I don't even remember the number of attempts I did to fix it. I'm really glad I finally nailed it, and I hope browsers would start supporting the `:focus-ring` pseudo-class, and that it wouldn't have that annoying heuristic that it has now and would work for any elements that have a set `tabindex`.

Thank you for reading.
