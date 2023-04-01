# React Hook Component

#Practical #Experiment #React #TypeScript

_After 16+ years of experimenting with CSS & HTML, I am a bit tired. Time flies, and new technologies emerge. What would you say if, from now on, I will start doing my wild experiments with, let’s say, React and Typescript instead? In my new article, I’ll show you how easy it is to have conditional hooks in React — and more!_

## The `<Hook>` 🪝

When using hooks in [React](https://react.dev/) or [Preact](https://preactjs.com/), we have to obey all of those rules. [The rules of hooks](https://legacy.reactjs.org/docs/hooks-rules.html). Don’t call them conditionally! You can’t use hooks inside Class components! Oh no, what is this? An update of a component from inside the function body of a different component?!

No more. React is like lego. Some people say there are [illegal lego techniques](https://www.youtube.com/watch?v=jWtZUzkvQ2E). I say — who cares when we can use duct tape?

I present you the `<Hook>` component. It is actually pretty simple, completely valid, and suitable for production[^production].

[^production]: No joke, we’re [using it](https://druids.datadoghq.com/components/misc/Hook) in Datadog (not a lot). <!-- offset="1" span="2" -->

### The Interface

First, let’s quickly go over its [TypeScript](https://www.typescriptlang.org/) interface[^any].

[^any]: Using `any` is often a bad idea, and we should avoid doing so (or use `unknown` instead). In this case, it should be harmless, as the provided hook would override it with its types. <br /> Note how this generic allows us to properly connect the types of the `hook`, `options`, and `value`. Neat! <!-- span="2" -->

```js
interface HookProps<F extends (...args: any[]) => any> {
    hook: F;
    options?: Parameters<F>;
    getValue?: (value: ReturnType<F>) => void;
    children?:
        | React.ReactNode
        | ((value: ReturnType<F>) => React.ReactNode);
}
```

If we want to call a hook, we need to have a `hook` prop.

`<Hook hook={useMagic} />` — here we go! As simple as that.

- What if our hook accepts some parameters? We have an optional `options` which accepts an array of options that would be later destructured into our hook.

- What if we want to just use the value, like, log it or something? `getValue` is a callback that would receive the value returned from our hook.

- What if we would want to render something conditionally based on this value? We can use `children` as a render prop that accepts the same value.

### The Code

I’ll present the code with TS kept intact, but the native JS version is basically the same, just remove the `<F extends (...args: any[]) => any>` and `: HookProps<F>` parts that make the hook generic and assign all the proper types to its props.

```js
const Hook = <F extends (...args: any[]) => any>({
    hook: useHook,
    options,
    getValue,
    children = null,
}: HookProps<F>) => {
    const value = useHook(...(options || []));

    useEffect(() => {
        if (getValue) {
            getValue(value);
        }
    }, [getValue, value]);

    return useMemo(
        () =>
            typeof children === 'function'
                ? children(value)
                : <Fragment>{children}</Fragment>,
       [children, value],
    );
};
```

As you can see, the component is pretty simple:

1. We’re calling the `hook` prop as a `useHook`, destructuring the options inside. That works just as if we were calling a regular hook inside our component.
2. We receive anything returned from it as a `value` that we could use later.
3. We have an effect that we’re using to call the `getValue` callback. It allows us to retrieve the `value` outside. In this implementation, we’re using a regular callback for the `getValue`, so we must be careful when passing it to the `Hook` — we have to memoize[^memoize] the callback properly. Having this inside a `useEffect` makes it safer to call things like `setState` from inside, as otherwise, it could happen as a part of the render, which we don’t want.
4. We’re using `useMemo` around the returned JSX. It is not strictly necessary, and often the `children` could not be memoized, but this makes the `Hook` slightly more reusable, as we won’t have an issue in case we’d _need_ the return from it properly memoized.

[^memoize]: Optionally, you could use a stable callback (like [useEvent](https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md)), if you’re not planning on updating the callback, or if you don’t want its update to cause a re-render, only basing it on the value. <!-- offset="8" -->

And that’s it! JS is flexible; a hook is just a function, so we can make a hook dynamic if we know what we’re doing and won’t break the rule of hooks by doing so.

## Usage Examples

Below is not a complete list of what we can do with this hook. Imagination is the limit!

### Conditional Hooks

Did you always want to run some complicated hook conditionally? Adding an `isEnabled` option, then guarding every hook inside with it, adding extra logic… What if we would… just run the hook inside a condition? Ok, not a _hook_, but the `<Hook>`.

```HTML
<div>
  {isHookRunning ? <Hook hook={useMagic} /> : null}
</div>
```

While conditional _hooks_ are a no-no, no-one restricts us from using conditional JSX elements. Then, when one is rendered — it runs its hook. If it is not — it doesn’t. Inside one element, the hook stays the same. All good.

### Hooks for Class components

You might already see how this allows us to go and use such component inside a Class component, connecting some logic from it with the logic inside our hook. Do you know those projects that provided declarative tags for states, with render props? Our `<Hook>` can do this as well!

Here is a sample Counter component using a `Class`, but using the `useState` inside:

```js
class CounterClass extends Component {
  render() {
    return (
      <Hook hook={useState} options={[0]} getValue={console.log}>
        {([count, setCount]) => (
          <button onClick={() => setCount(count + 1)}>
            bump this counter: {count}
          </button>
        )}
      </Hook>
    );
  }
}
```

If you, for some reason, have a bunch of older Class-based components that you can’t or don’t want to convert to function ones, but you’d want to use some of your shiny hooks inside of them — `<Hook>` could come to your rescue!

### Updating a component from inside the function body of a different component

Sometimes your code is a mess, and you don’t want to untangle it. All you want is to run that `setState` somewhere inside some other component’s body, like inside its render props. You try this, and when you wake up, you’re looking at this link: https://github.com/facebook/react/issues/18178#issuecomment-595846312

To work around this, we could apply any _effect_ anywhere any `JSX` could go:

```js
<Hook
    hook={useEffect}
    options={[
        () => {
            // Some code that runs inside our effect.
        },
        [], // Our effect's deps.
    ]}
/>
```

### Error Boundaries

Do you have your own `ErrorBoundary` component? And would you want to make sure if your fetching hook fails, you’d catch it with that component? Move your hook inside a `<Hook>`. Now your code is safer[^safer].

[^safer]: Not guaranteed. <!-- offset="2" -->

## Live Examples

If you, for some reason, do not believe that all of this works — below I provide you with a CodePen running this hook code with a few examples. The examples are not practical and are mostly for demonstration purposes.

Note: I’m using Preact in the CodePen below, but, of course, all the same works with regular React as well. The types are using React versions of the types and interfaces because I like to live dangerously, and I have mostly just copied & pasted the code, and CodePen doesn’t seem to mind. Hooray?…

{{<Partial
  iframe="https://codepen.io/kizu/embed/VwGJKLW?default-tab=js%2Cresult&editable=true&theme-id=light&border=none"
  height="100%"
  alt="CodePen with the Hook examples"
  style="grid-column: both; padding: 0; overflow: hidden; margin-right: 1rem; height: calc(100vh - 2rem)"
/>}}

Ok, I know those examples are rather lackluster, but you should get the idea.

## In Conclusion

If you’re looking at the date this post was published and are wondering: “Was all of it a joke?” — wonder no more. Some of it is, but some of it isn’t.

No way I would stop experimenting with CSS and HTML! So many things are happening, CSS evolved so much in the last few years, and HTML seems to catch up slightly — at least projects like the [Open UI](https://open-ui.org/)'s [Popover API](https://open-ui.org/components/popover.research.explainer/) look very promising. I can’t wait to dig deeper into it: after all, it all lines-up so nicely with [anchor positioning](/anchor-positioning-experiments/) in CSS!

However, the component I’m talking about in this article is real. Even though the technique is questionable, in some cases, it could make your life easier.

In the last few years, I played with React, its hooks, the ways to write APIs for them (and for JS/TS in general) enough to have some _ideas_ and experiments I can share. I won’t do that often — after all, I already have a few drafts about the next CSS-related things I’d want to write — but maybe I’ll start sharing some other stuff.

I do not like the “April fools” disinformation flood, so I took this day as an opportunity to share something slightly silly but still useful. Another thing — I did write this post in less than a day — which is very rare for me, so I did not try to polish it too much and took this as a way to see if I could write things faster than the month it took for my last article :)
