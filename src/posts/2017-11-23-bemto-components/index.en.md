# Bemto-Components

#Project #Practical #React #BEM

_Working within a React stack and using Styled Components, I found out that I still miss a lot of aspects of BEM. This lead to me starting a new side-project which not only allows to use BEM-style elements and modifiers, but also enhances the overall developer experience._

So, here is a thing I'm working on at my free time these days:

> [bemto-components](http://kizu.ru/bemto-components/) ([github repo](https://github.com/kizu/bemto-components)).

In the last 6 months, I was working mostly with CSS for projects using React and I've tried a few ways of doing components and styles for them. For styling purposes I found out that [styled-components](https://www.styled-components.com) work the best for me: you write proper CSS there (and not some kinds of JS object abominations), and everything works pretty nice.

However, what I missed is some stuff that I got used to while working with markup in [BEM](https://en.bem.info/) way. With styled-components you can essentially get only really simple and small components. If you'd need complex internal structure, you'd need to do more work with plain React/JSX, and if you'd need variations, then you were left just with either extending (which is cumbersome for when you need multiple modifications), or by using interpolations with props inside styled-components (which can become CSS-in-JS-in-CSS-in-JS rather easily which is unfortunate and not very readable).

After some experiments, I've come up with the project that I think would solve most of the problems I had with React+styled-components and would provide a lot of quality-of-life features I've missed from the BEM and HTML preprocessors days.

## So What Are They?

I won't go to lengths there, as I've already written [a lot of docs](http://kizu.ru/bemto-components/), so I'll copy the beginning there:

Bemto-components are smart components for using BEM methodology with React. Best used together with styled-components.

They provide:

- [Reusable, configurable, easy to create HTML elements.](http://kizu.ru/bemto-components/#html-structure)
- [Elements and Modifiers from BEM.](http://kizu.ru/bemto-components/#bem)
- [Styled-components support from the box](http://kizu.ru/bemto-components/#styled-components), totally optional.

Links above go to the corresponding sections of the docs, and there are too many features to mention in a blog post, so go there ↑, each example there is an interactive playground by the way.

## Bemto-button

However, if you'd want to see a more real-life example, there is another project: [bemto-button](https://github.com/bemto/bemto-button), it is a foundation for all the buttons I use in my markup for more than 4 years, now in a form of a React component.

[The docs for it](http://kizu.ru/bemto-components/#bemtobutton) are incorporated into the docs for bemto-components, and there is an interactive playground in all the examples as well.

This button component is the example of why I made bemto-components: it was really easy to create, and now it is really easy to use.

## Future

All of this is just a start: not all the features of bemto-components are there in the docs (and those docs probably contain a lot of typos and overall bad-written, as I didn't yet have time to review them), but I'm planning to add new features, write new docs, and create new components similar to bemto-button.

If you're using React and styled-components (or, for bemto-components, anything else, as they are pretty styling system agnostic at the moment), I hope you'll try them and would tell me what do you think.
