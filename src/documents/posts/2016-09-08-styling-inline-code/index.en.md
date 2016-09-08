# Styling inline code

When I was working on [my site's new version](:the-new-version-of-this-site), I tried to think more about how everything should look and read typography-wise. And one of the things I always had problems with was how to style inline code blocks. Most of the time we can see small colorful rectangles in place of them. And the more you put those things inside your text, the worse the reading experience becomes.

![Screenshot from Wikipedia](example.png "*This example is taken from a [Wikipedia article on CSS](https://en.wikipedia.org/wiki/Cascading_Style_Sheets#Selector). Look at all those colorful rectangles. Also, note how some of the things that could be inline code blocks are not marked as such as they surely would introduce even more visual clutter.")

What if that overused inline code blocks' style is just redundant?

Almost everything we see there is coming from how the proper multiline code blocks are often presented. But do we really need  all those styles in an _inline context_?

**Do we need monospace font?** Nope. Monospace is useful when we have multiple lines and need to align symbols in a nice way. But inside a regular text? We don't need it. Go away, monospace font.

**Do we need borders and any background color?** Unlikely. When we have a big single code block they're ok, but those styles become too bright and eye-catching in an inline context. They make your inline code blocks too **bold**, and it would worsen the text's readability, as the eye would pay attention to those bright spots before you'll read the whole text.

**Do we need syntax highlighting?** I doubt it. It is useful when we have a lot of code and need to separate some things from the other, but when we have only one or two words inside out code blocks, the highlighting is just unnecessary and won't do anything except for getting more of our attention to it.


## My Solution

So, if all those styles are redundant, or even harmful for our text, what should we use instead? After some thoughts about all those issues, I started to look into how people are styling similar entities in regular books. When it comes to the non-obtrusive way of emphasizing some parts of the text the solution is obvious. _Italic_. And if it is useful for the regular texts,  why couldn't we use it for our inline code blocks?

![Fixed screenshot from Wikipedia](solution.png "*My version of the above example now reads better as a text. The bottom inline code blocks, the ones with the whole CSS rules, were actually a bit better with the highlighting, so it would be possible to reintroduce it there, but not as brightly as it was before.")

Actually, you can look at an inline code block [right there](*semantics "Here I used just an `<em>`, as this post could be seen on RSS-readers and in other places where you wouldn't have the proper code blocks' style like I used for my blog."): _font-style: italic_. I think that it look rather nice — unobtrusive, but separate from the regular text.

Italic separates the code from the other text just fine, in most cases, you won't need anything else there. The easiest way to make your inline code blocks italic is something like this:

    :not(pre) > code {
        font: inherit;
        font-style: italic;
    }

    {:.language-styl}

This would make your inline code blocks to look like a regular italic text. Note the `:not(pre)` — if you'll mark your big code blocks using `<pre><code>`, this selector won't match them. Of course, if you're using some kind of syntax highlighter, you'll need to disable it (or override its styles) for inline code blocks. In some cases, when you're using a different web font for the italic, you'll need to specify this too to not make a faux italic instead, of course.

There can be some cons for this solution. For example, if you'd want to have some _regular emphasis_ you'll have the same style for both it and inline code blocks. But in most cases reader would know the difference from the context and it won't matter much.

## Yes, It's All Subjective

Italic for inline code blocks can be, of course, unusual. But I'm not saying that that's the only possible solution.
Overall, it is a matter of style — how you would present your inline code blocks. Sometimes you'd want them to pop and bring reader's attention. But if you'd want to have your texts with a lot of inline code blocks to be more readable — italic could help you.
