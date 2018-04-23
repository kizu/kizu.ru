# SVG Stacks with Media Queries

I love SVG and what I don't like is how browsers don't tend to improve in the support for them. And while some time ago it could be called “a chicken and egg problem” — there were no support because of lack of usage and developer interest, as well as developers didn't look at SVG because there were a lot of bugs and inconsistency everywhere.

But in the last year or two I saw a lot of articles on SVG and a lot of people use it more and [more](*articles "For example a few days ago my colleague from Yandex, Alexey Ten, wrote [an article](http://lynn.ru/examples/svg/en.html) on simple but powerful technique for graceful degradation with SVG"). I'd say it's what “Retina” did, but whatever.

Anyway, I'd like to talk about one of those hard-needed features that won't ship there anytime soon: SVG Stacks. You can be familiar with this idea from [this great article of Simurai](http://simurai.com/post/20251013889/svg-stacks) — the point is to have different SVG images inside one file and to show only the one we need using `:target` in CSS embedded in SVG and urls like `url(stack.svg#foo)`.

But we can't use it because of [ephemeral security reasons](https://code.google.com/p/chromium/issues/detail?id=128055#c6). Well, whatever.

I'd like to show you how we can achieve something similar today.

It is a hack, it is an experiment, it have its flaws and it was not tested in production. But hey!

{{<Partial "svg-stack-queries.html" />}}

Well, the code wouldn't be that elegant as with original SVG Stacks idea, but what I did is a Proof of Concept.

The HTML for those icons is this:

    <span class="icon-wrapper">
        <img class="icon icon_download" src="test3.svg" alt="">
    </span>
    <span class="icon-wrapper">
        <img class="icon icon_next" src="test3.svg" alt="">
    </span>
    <span class="icon-wrapper">
        <img class="icon icon_print" src="test3.svg" alt="">
    </span>

    {:.language-html}

The SVG itself would look like this:

    <svg xmlns="http://www.w3.org/2000/svg">
        <style>
    
    .icon { display: none }
    
    @media (aspect-ratio: 1/2), (aspect-ratio: 2/1) { #download { display: inline; }}
    @media (aspect-ratio: 1/3), (aspect-ratio: 3/1) { #next { display: inline; }}
    @media (aspect-ratio: 1/5), (aspect-ratio: 5/1) { #print { display: inline; }}
    
    @media (orientation: landscape) { .icon { fill: blue; } }
    
    
        </style>
    
        <path class="icon" id="download" d="M2,6h3V1h6v5h3L8,12m7,1v2H1V13"></path>
        <path class="icon" id="next" d="M5 1v14l9-7"></path>
        <path class="icon" id="print" d="M4,2h8v2h1V1H3v3h1M0,5v6h3v1l3,3h7v-4h3V5m-3,2v1H12v6H6V12H4V8H3V7m2,1h6v1H5m0,1h6v1H5"></path>
    </svg>

    {:.language-markup}


And the [_basic_](*webkit-bug "There is a bug in Webkit preventing the icons to be shown on page load. You could fix it with something that would cause a reflow, like an animation, you can see how I applied it in the …") CSS would look this way:

    .icon-wrapper {
        display: inline-block;
        vertical-align: top;
        overflow: hidden;
        
        width: 16px;
        height: 16px;
    }

    .icon {
        vertical-align: top;
    }

    .icon_download       { width: 120px; height: 240px; }
    .icon_download:hover { width: 240px; height: 120px; }

    .icon_next           { width: 120px; height: 360px; }
    .icon_next:hover     { width: 360px; height: 120px; }

    .icon_print          { width: 120px; height: 600px; }
    .icon_print:hover    { width: 600px; height: 120px; }

    {:.language-css}

I guess you already got the idea? While we can't use `:target`, you could already know that we can use [media queries in SVG](*clowncar "See, for example [Clown Car Technique](http://coding.smashingmagazine.com/2013/06/02/clown-car-technique-solving-for-adaptive-images-in-responsive-web-design/) by Estelle").

So, we hide all the icons inside an SVG and then showing them when the specific media queries are triggered.

Some notes on some things in code you're already wondering on:

1. We should use `<img/>` (or any similar method) instead of SVG in CSS backgrounds, 'cause there are a lot of [issues](*svg-in-css "…") with backgrounds in different browsers. And that's sad, 'cause we could use only one element in HTML for those icons then, using `background-image` or pseudo-elements.

2. I've used a wrapper to show only the actual part of the SVG, hiding the extra canvas that is needed only for media queries. However, if you're ok with absolute positioning, you could use it along with `clip` to hide the extras:

        .icon_absolute {
            position: absolute;
            clip: rect(0, 16px, 16px, 0);
        }
        
        {:.language-css}
        
3. An important part: your `<svg>` tag should be without `width`, `height` or `viewBox` attributes. This would make icons to not resize when the container resizes, so we could actually change the size of `<img/>` containing the SVG without resizing the icons.

4. While you could use MQ with `min-width` and `max-width`, I ended up with using `aspect-ratio`. Why? Because if we'd resize the page, the size of icons would change, and the width/height based MQ would broke (at least in webkits).

5. And I used a bit big numbers like `120px` etc. to keep the aspect ratios strict — if we'd use small ones like `16px` etc, then on page resize they would be changed unevenly, so the `aspect-ratio` would be broken. Having a big number makes most of the zoom levels preserve proper aspect ratio.

6. If you'd want to use only icons, without the hover state, the code would be even simpler, but I shown this there 'cause it's just another nice use case for SVG Stacks, and also to show how you can do it using MQ: you show an icon on both orientations — `(aspect-ratio: 1/2), (aspect-ratio: 2/1)` and then you can use one of them to make a hover state, and you could use the same one for every icon using `orientation` query.

So, that's it! While all this works, there are still a lot of issues in different browsers, most of them are in webkits. For example, those icons won't resize in a vector way on iOS (what would be the best way to fix it? Make icons bigger from the start and them zoom them down using transforms?), they need the animation both on the page load and on hover (there are _strange_ bugs for this) and who knows what else could go wrong?

But I still love this small experiment, 'cause it makes the idea to work and I can't wait for the bright future when we could just use proper SVG Stacks without all those hacks.
