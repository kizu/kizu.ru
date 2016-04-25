# Battle for Baseline

![Kitties](flex-baseline.jpg "{:width='756' height='478'}")

The best solution for inline blocks were, well, inline-blocks. I used to like them, because you could solve a lot of tasks with them. But they're not ideal. They're not capable of doing baseline vertical aligning *right*. And the problems come straight from the [specs][vertical-align], just read the last two paragraphs to see the problems:

1. “The baseline of an `inline-block` is the baseline of its **last** line box in the normal flow”.

2. “If [`inline-block`'s] `overflow` property has a computed value other than `visible`, [its] baseline is the bottom margin edge.”

Those rules make only onelined simple inline-blocks usable with `vertical-align: baseline`, in all other complex cases we would get not what we would need.

Here is an example: all three blocks have `display: inline-block`, the first one is simple oneliner, but with bigger padding, second one is multiline, but has smaller font-size and the third one has `overflow: auto`.

[partial:flex-baseline1]

You [can see](*safari "Btw, in the latest Safari the block with `overflow` don't behave according to the specs") where each block has its baseline in this example.

## inline-table

Actually, there was one place in CSS, where the baseline aligning worked *properly*: `display: inline-table`. If we'd use it instead of inline-blocks in our example, we'd get almost what we tried to achieve:

[partial:flex-baseline2]

You can see an obvious flaw: the `overflow: auto` is not working. And you shouldn't forget that you'll need to have `table-layout: fixed`. So, `inline-table` is nice as long as we don't need `overflow` other than `visible`.

## Trying to go flex {#trying-flex}

So, can we do a block both with the proper baseline and with some `overflow`? It seems we can, using flexboxes — `display: inline-flex`. In [theory][flex-baselines] they have a proper baseline position in all complex cases, but what would we get in practice?

[partial:flex-baseline3]

If you'd look at this example in any browser other than Firefox, you'll see nicely aligned blocks (yep, even in IE10 and Opera 12).

But in Fx the block with `overflow: auto`, suddenly, behaves just like the inline-blocks — it loses the baseline. So sad, this way we'll need to wait for this [newly reported bug][bug1] to be fixed.

## Is there another way? {#another-way}

It is nice we could align `inline-flex` blocks with the baselines of other blocks, if only there wasn't this Fx bug… But what if we'd go and try to align not different `inline-flex` blocks, but their children?

[partial:flex-baseline4]

Oh, it works. But… While multiple `inline-flex` blocks could wrap on overflow, for elements inside flexbox we would need to use `flex-wrap` to wrap them. And guess what? Firefox didn't support this property until 28.0.

## All together {#combined}

But hey! If `inline-flex` is properly aligned alongside other blocks and the nested block with `overflow: auto` also has a proper baseline, then what if we'd combine those two? We would add another wrapper inside each element, then move all the paddings and overflow to them:

[partial:flex-baseline5]

In most browsers you won't see any changes, but when we'll look at Fx, we would see that the blocks now won't have baseline at their bottom margin edge. But they won't have it at the proper place either — they're shifted from the baseline of other blocks a little. Let's measure it — 10 pixels. Hey, it is our padding! By removing paddings from each side we found that the problem is at the top padding — when we remove it everything works great. So, if the bug is in the padding ([and I reported it too][bug2]), how could we workaround it? Let's remove it and replace with a pseudo-element:

[partial:flex-baseline6]

Perfect!

## Finishing strokes {#finishing-strokes}

Well, not perfect. There are two small issues that can appear in IE 10 and Opera 12.

In IE flexbox with the set width wouldn't have wrapped text inside of it. That's a rather strange bug, but we could workaround it by adding `width: 100%` or `-ms-flex-negative: 1` to the inner element, the latter is better.

Opera has a similar bug — the element inside a flexbox would have width set to content. The only fix I found is adding `flex-direction: column` to flexbox. As there would be only one element inside our wrapper it won't affect anything else.

There, [now it's perfect](*without-fallbacks "No fallbacks for older browsers though, but this slightly falls out of this post's scope"), there is the last example with different variants of blocks and with the wrapping blocks:

[partial:flex-baseline7]

The resulting code for this example would be:

    .flex {
        display: -ms-inline-flexbox;
        display: -webkit-inline-flex;
        display: inline-flex;

        /* Fixing Opera issue */
        flex-direction: column;

        vertical-align: baseline;
        }

    .flex-content {
        padding: 0 10px 10px;
        border: 1px solid lime;

        /* Fixing IE issue */
        -ms-flex-negative: 1;
        }

    /* Fixing Fx issue */
    .flex-content:before {
        content: "";
        display: block;
        padding-top: 10px;
        }

    {:.language-css}

## Overall {#resume}

Ah, Firefox! Without its bugs (and IE's one) we could use only one element per block. Also, if you'll need just multiline inline blocks, and you're not afraid of tables, you could use `display: inline-table`.


But, overall, we won. We can now use baseline vertical aligning for blocks of any complexity, hooray! But if you'd want to write even better code in the future, I'd recommend you to go and vote for the [corresponding][bug1] [bugs][bug2] at bugzilla.


[bug1]: https://bugzilla.mozilla.org/show_bug.cgi?id=969874
[bug2]: https://bugzilla.mozilla.org/show_bug.cgi?id=969880
[vertical-align]: http://www.w3.org/TR/CSS2/visudet.html#propdef-vertical-align
[flex-baselines]: http://www.w3.org/TR/css3-flexbox/#flex-baselines