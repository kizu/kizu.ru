---

categories: en blog

layout: post

published: true

invisible: true

---

# Flex Baseline

I used to love inline-blocks. You can do a lot of things with the inline flow using them, and most of those things were not easy to do using any other method.

But there always was one aspect of their behavior that made me mad: baseline vertical alignment. In most cases you could want to use `vertical-align: baseline` for inline elements. But, according to specification, inline-blocks have two big flaws:

1. The baseline for multiline inline-blocks is set at the **last** line box.

2. If inline-block have `overflow` other from `visible`, its baseline is placed at the bottom margin edge of this block.

So, while we can align simple blocks by their baselines, we're doomed when more complex blocks are coming into play, so with a wrapped text inside an inline-block, or with `overflow: hidden` on it we lose the ability to align blocks according to their baseline.

*пример хреновых инлайн-блоков*

## Winning the battle with flex

This is when the `flex` appears and wins. Blocks inside the `flex`, in fact, do not inherit the broken behaviour of inline-blocks, it would work *properly*.

### Multiline children

To align children of a `flex` block by their **first line box'** baseline you would need to place this on their parent:

{:.language-css}
    display: flex;
    align-items: baseline;

*пример*

This would make everything work like a charm in all modern browsers! Hooray!

### Overflow

However, with the `overflow` other than `visible` there is on issue.

{:.language-css}
    display: flex;
    align-items: baseline;
    overflow: hidden;

*пример*

While in webkits everything works ok — the baseline is placed where it should be, in Fx this would work only if the children do not have any top paddings. As long as they have it `> 0`, the bug appears and the block is aligned lower than it should be.

*есть ли воркэраунд?*

## inline-flex

Ok, so `display: flex` could help us to align its children using thir baseline.

But how would the `inline-flex` be positioned near other such blocks, or near other inline-blocks? It is close to the children bahavour, but there still are some issues.

### Multiline inline-flex

When we have multiline inline-flex block everything, again, works ok.

Со многострочностью, опять, всё хорошо: такой блок, в отличие от инлайн-блока, будет иметь базовую линию на первой строчке.

*пример*

### inline-flex с overflow

А вот с overflow всё печальнее: в вебкитах всё ок, но всё опять взрывается в Fx, причём на этот раз совсем: Fx в этом случае ведёт себя как с инлайн-блоками и ставит базовую линию на нижнюю границу маджина.

*пример*

## Итого

В заключение можно сказать, что для выравнивания по базовой линии флексбокс оказывается незаменим. Для надёжного выравнивания лучше использовать выравнивание через `align-items` + воркэраунд для верхнего паддинга внутри блоков с overflow, отличным от ноля.

Выравнивать инлайн-флексы относительно друг друга можно, но только с overflow: visible, пока не будет починен соответствующий баг в ФФ.

*найти/завести баги ФФ*
