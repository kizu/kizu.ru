# Stylus, Yandex.Mail and conditional IE styles

Hi there. Here is a translation of [the article](http://habrahabr.ru/company/yandex/blog/169415/) I wrote in russian for Yandex’ blog at Habrahabr. There I wrote on how we ended up with using [Stylus](http://learnboost.github.com/stylus) CSS preprocessor in our [Mail service](http://mail.yandex.com/) and why we did it.

Along with that I'll feature my little library/methodology on messing with IE styles using the magic of Stylus — [if-ie.styl](gh:kizu/if-ie.styl).

That's only the first article in the series, I'll write more on how we use Stylus someday.

## How we ended up with using prepressors

While our Mail service look like a simple web app, it actually contains a lot of different blocks, modifications of those blocks and different context where those blocks could appear.

Moreover, there are more than thirty themes available for the app. There are themes with light and dark backgrounds, there are ones that differ only with hues, and there are other — like the one with the graphical interface made of plasticine ([literally](https://www.youtube.com/watch?v=qrDU3ErUiHA&hd=1)). Some themes have only one background image, other could have a lot of different variations chosen either randomly or according to the current weather or the time of the day.

All this results in a lot of variations of the visual interface and makes us to find unusual ways and tools that would fit our needs perfectly.

When we started to develop the new (early 2010) version of the Yandex.Mail, we had the tool that we know: Template Toolkit 2, so we used it for generating this CSS for themes. There were simple variables and conditions, so it went ok. But with the number and the complexity of themes growing the tt2 become not that handy to use, so we started to look at the more specialised tools — CSS Preprocessors.

## Choosing the preprocessor

We looked at the best three available preprocessors at the time: Sass, Less and Stylus. The selection process was rather easy: we taken some of our complex blocks and tried to rewrite their CSS using each of the preprocessors.

[**Less**](http://lesscss.org/) looked rather simple and handy at first: it uses the familiar CSS syntax and it can be used in the browser which is useful for debugging. However, when we tried to make more complex things with it we found out that it's also simple in other way — what could you achieve without arrays, cycles and proper conditions? Not that much.

Then we tried [**Sass**](http://sass-lang.com/) and it was really nice. Powerful, offering two syntaxes, community and a lot of existing code including libraries like [Compass](http://compass-style.org/). But we found out just one big drawback there: Sass have very limited parent reference feature (using `&` symbol in nested selectors to, well, reference the parent). The main problem is that you can't use it for prefixing with multiple classes or elements and for concatenating the classes with any postfixes. Here are a few examples of what you _can't_ do in Sass (and can in other preprocessors):

- `&__bar`
- `.baz&`
- `button&`

…

## [if-ie.styl](gh:kizu/if-ie.styl) library

### The base for the methodology

### Extra features of if-ie.styl

### `inline-block`

### `rgba-ie`
