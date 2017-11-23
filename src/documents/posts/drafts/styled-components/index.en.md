# Styled Components

For some time I'm writing my CSS in context of React components and I we went in our projects from using plain CSS/PostCSS-based styles to embracing [styled-components](https://www.styled-components.com/).

In this article I'll briefly explain what styled-components are, how I use them, which their quirks you should know and how you can use them with in the most effective way.

## What Are Those?

Styled-components is probably the best way to write CSS in JS. I was always sceptical (and still am) re: CSS-in-JS, and I'm not yet sure if that's [the best way](*single-file-components "I like the ideas like [“Single File Components”](https://vuejs.org/v2/guide/single-file-components.html) from Vue.js to be much more accessible for average web developers") to write styles, but if you're stuck with React and you need to have any CSS for your components, then right now styled-components are the thing you would have the least amount of troubles with.

You can read more about how styled-components are used and [how they work](*tagged-template-literals "And if you'd want to read more about the syntax — the target template literals — there is [a nice article about them](https://mxstbr.blog/2016/11/styled-components-magic-explained/) by one of the styled-components' author.") at their [docs](https://www.styled-components.com/docs/basics), but in the nutshell they can look like this:

    const MyComponent = styled.div`
      /* Styles applied to the component itself */
      display: flex;
      padding: 20px;
      color: #FFF;
      background: #000;
      
      /* States, pseudos and more */
      &:hover {
        background: lime;
      }
      
      &:before {
        content: 'hewwo ';
      }
      
      & + & {
        margin-top: 20px;
      }
    `;
    {:.language-css}

What this does is it gives you a `MyComponent` component which you could later use as `<MyComponent>` and which would come with the styles you pass to it in a tagged template literal.

Inside the template literal you can not just write your usual native CSS, but also use familiar from preprocessors nesting for states, pseudo-elements and more. All of these work because styled-components insert all their CSS as `<style>` tags inside the `<head>` — unlike some other CSS-in-JS solution you won't need to bother with all those inline styles!

And styled-components does that by generating unique classnames for your components, so you won't have collisions and could think less about the naming (you'd need only to come up with the component's name this way).

## Nesting Other Components

My favourite feature of styled-components is that you can use [interpolations](*interpolations "There are other uses for interpolations of course, like [adopting based on props](https://www.styled-components.com/docs/basics#adapting-based-on-props), which I'll mention later.") inside its template literals for mentioning other styled-components.

Look:

    const Link = styled.a`
      color: blue;
      text-decoration: none;
    `;
    
    const Text = styled.span`
      /* Here we mention the Link component! */
      ${Link}:hover > & {
        text-decoration: underline;
      }
    `;
    {:.language-css}

When used like this:

    <Link href='#heyho'>“<Text>foo bar</Text>”</Link>
    {:.language-html}

You would get what you'd expect: two nested elements and the child one would have different styles whenever the parent is hovered.

This is done by using the interpolation inside the `${Link}:hover` part — styles-components are smart enough to detect that you pass a styled-component there and substitute there its classname.

That is: whenever you have any styled-component, you can reuse its className in other styled-components' CSS using interpolations and that gives us back a lot of CSS powers which other CSS-in-JS solutions lack as well. While its a nice idea often to make components entirely independent, in real life you'd still often need to use the powers of nesting, and this feature allows you to do it in a proper way.


## Mixins

???

## BEM + styled-components

Before coming to React, I've used [BEM](https://en.bem.info/methodology/key-concepts/#block) almost for everything for years, and I'd argue that when you're left with just CSS, BEM would be the [best methodology](*alongside "Of course, you can use BEM in addition to almost anything you'd like, for example, it goes really nicely together with [ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/) by [Harry Roberts](https://twitter.com/csswizardry)") to use.

But when it comes to React and styled-components… I'd say, there are still parts of BEM you could integrate into your workflow. Some of that stuff would be easy to implement, other — would be trickier, but still possible.

### Elements

While BEM's “Blocks” are just “Components”, can we have “Elements” somehow? Let's look at the definition:

> Element is a part of a block that has no standalone meaning and is semantically tied to its block.

When talking about components, that would be basically any local subcomponents you've used for your main component and probably did not exported.

But what if we'd want to use them closer to how they're used at BEM? I've found a really neat and really simple way to do it just with native JS: we can save our elements as properties of the original components!

    const MyBlock = styled.div``;
    MyBlock.Element = styled.div``;
    {:.language-js}

Then, when we'd need to use them in JSX:

    <MyBlock>
      <MyBlock.Element>Hello</MyBlock.Element>
    </MyBlock>
    {:.language-html}

Yep, that works. Alternatively, if you'd want to use shorter name locally, you could do

    const MyBlock = styled.div``;
    const Element = styled.div``;
    MyBlock.Element = Element;
    {:.language-js}

And in both ways the main point would be that whenever you'll export your Block, you'll export all the elements with it. And that means you'll have a simple access to them whenever you import them — the elements of a block are simply its API, and this way its really easy to split the block's structure into a bunch of reusable components, and always have them with it whenever you'll need them.

### Modifiers?

Ok, the basics: blocks and elements of BEM are covered. But do we need modifiers? Styled-components provide a few ways to have different variations of your original components, and I'll argue that if we would implement BEM's modifiers, then at least for styling issues that would be much better way.

But, at first, let's talk a bit about why the existent possibilities are not enough.

#### Property Interpolations

As I did mention above, we can use interpolations inside the styled-components' CSS. Here is an example from the docs:


    const Button = styled.button`
    	/* Adapt the colours based on primary prop */
    	background: ${props => props.primary ? 'palevioletred' : 'white'};
    	color: ${props => props.primary ? 'white' : 'palevioletred'};
    `;
    {:.language-css}

We can pass arrow functions inside interpolations which accept the component's props and then do different stuff based on those props' existence or values. And that works really nice: styled-components are smart enough to create proper permutations for each such case. And as we can use almost any JS inside those interpolations, they seem to be very powerful, right?

But here are the problem: it is cumbersome, have bad readability and we are essentially having a JS-in-CSS-in-JS problem — at one point, for complex cases (like, when we have multiple intersecting variations), it could become really hard to understand what happens there. And whenever we'd need more complex cases, with lots and lots of code that depends on some property, it becomes much harder to maintain as well.

And another thing, which could be much more important: we usually don't have access to those props inside other components, and that means we couldn't use those modifications like we could use the BEM's modifiers: we can't target a specific modification from another component.

#### Extends

Another feature that comes with styled-components is an ability to extend other styled-components, again, a reduced example from the docs:

    const Button = styled.button`
        color: palevioletred;
        border: 2px solid palevioletred;
    `;
    const TomatoButton = Button.extend`
        color: tomato;
        border-color: tomato;
    `;
    {:.language-css}

Here we would have both original `<Button>` and a new, _modified_, `<TomatoButton>`. Can we call and/or use it as a BEM-like modifier? The answer is no: even if we'd forget about [the nuances](*extending-nuances "For example, this becomes a completely new component, so `<TomatoButton>` won't match a `${Button}` used elsewhere. This can be somewhat worked around using the `styled()` factory instead, but that won't solve the other problems.") that come with extending, we couldn't use multiple different modifiers this way. Say, we'd want to have three different themes for a button, alongside four different sizes, there is no way we could do it using just the extends.

#### Global Modifiers or Attribute Selectors

We can _somehow_ do similar stuff using the global modifiers — just some classnames that we would attach to the component which we could use like

    const MyBlock = styled.div`
      /* Just a normal classname */
      &.isModified {
        background: red;
      }
    `
    {:.language-css}

But by doing so we're losing one of the styled-components core feature: generated unique classNames. That means that our added global modifies could potentially overlap with any other styles. And another but minor thing: compared to the BEM-style modifiers this would have a bit more specificity.

We could potentially use attribute selectors and attach properties which we could match on later in CSS, but those would have the same two problems, with an addition of a slightly worse selector matching performance.

### Proper BEM Modifiers

hewwo


### File Structure

## Common Problems

### Using Not Styled Components

### Styleguidist


