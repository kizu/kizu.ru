# Styling inline code

When I was working on my site's new version I tried to think more about how everything should look and read typography-wise. One of the things I always had problems with was how to style inline code blocks. What we can see in place of them most of the time, are small colorful monospace rectangles. And the more you place those things inside your text, the worse the reading experience becomes.

What if that overused inline code blocks style is just redundant?

Think about it: most of its traits are coming from its bigger sisters — proper multiline code blocks. But do we need those styles in an inline context?

Do we need syntax highlighting there? I doubt it. It is useful when we have a lot of code and need to separate some things from the other, but when we have just a couple of words or even a single word it is just unnecessary and won't do anything. So we can safely throw it out.

Do we need monospace font there? Nope. We'll need monospace when we have multiple lines and need to align things in a nice way, but inside a regular text? We don't need it. Go away, monospace font.

Do we need borders or highly contrast backgrounds? Unlikely. When we have a big single code block they're ok, but in inline context they make those small code blocks too bright and eye-catching. They make your inline code blocks too **bold**. It would worse your code's readability and won't serve much purpose.

## My solution

After some thoughts about all those issues I started looking into how people style their text in regular technical books, like in dictionaries, maths books etc. When it comes to the non-obtrusive way of emphasizing some parts of the text the solution of is obvious. _Italic_.

So, why not use italic to style your inline code blocks? Look at this: [_font-style: italic_](*semantics "Here I used just an `<em>`, as this post could be seen on RSS-readers and in other places where you wouldn't have the proper code blocks' style like I used in my blog.") — was that obtrusive? I think it looks just fine.

Italic separates the code from the other text just fine, in most cases you won't need anything else there. The easiest way to make your inline code blocks to look like that is this:

``` styl
:not(pre) > code {
    font: inherit;
    font-style: italic;
}
```

This would make your regular monospace inline code blocks to be just a regular italic text. Note the `:not(pre)` — if you'll mark your big code blocks using `<pre><code>`, this selector won't match them. Of course, if you're using some kind of syntax highligter, you'll need to disable them for inline code blocks, but otherwise this is a really simple solution.

There are some cons for this solution of course:, like if you'll want to have some regular emphasis you'll have the same style for both it and inline code blocks. But I'd say that in most cases reader would know the difference from the context.
