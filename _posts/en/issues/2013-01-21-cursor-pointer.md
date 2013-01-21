---

title: Correct cursor on active elements

categories: en issues

layout: post

invisible: true

---

{% include references.md %}

Every active element must have a set `cursor` on hover. And it should be `cursor:pointer` in most cases.

By active elements I mean links, buttons, selects, labels with checkboxes and radio buttons, and other similar elements.

Those elements should be treated as “active” when clicking on such element results in any action. Thereby a menu item for the current page, checked radio button or disabled buttons or links are not active elements, so they shouldn't have any change on hover.

At first I thought that it's obvious, but then I found out that there are a lot of developers who think otherwise. And I didn't find any proper arguments against `cursor:pointer` for active elements after reading all their points of view.

In this article I'll tell you my arguments at first, and then I'll discuss all the arguments against my point of view, describing why those arguments hadn't incline me from it.

## My arguments for changing the cursor

### Visual Feedback

The main profit from changed cursor for me is the visual feedback. Ideally every custom element should change it's state on hover. For example it could be a background or color. However, in real life such could state could be absent or wouldn't differ much from the original state or happen with a transition, so there would't be feedback, or it wouldn't be obvious.

But you surely would see when the cursor changes — this happens instantly and stable. The click that could follow the mouseover would be _intuitive_, otherwise the brain would need to match the position of the cursor with the element or spot the element's change and find out if it's a hover state over this element's active area or something else.

Changing of the cursor is the most natural, noticeable and obvious feedback that you could easily add to any element.

### Delimitation of the active area

There are a lot of cases when you should hint user that he could  click already. You could often want to increase the clickable area of different elements like small icons or menu items placed near the window edges. In those cases adding a cursor on hover would help user to find out when he could click on an element.

In some cases, when there are many elements near each other, the cursor wouldn't be enough to tell which element is hovered — in those cases you should change the visual state of those elements. It would be nice to have there anyway.

Anyway, if you'd hint user when to use any specific active element, user would use to it and it would be easier for him to use the UI next time — he'd need to target with less precision, because he'd know that active area of an element could be bigger  that it can be seen. And when he'd move the cursor he could click right at the moment the cursor would change. Otherwise, if an element don't change it's cursor on hover, the user should to aim carefully to hit the area of a small element like icon or checkbox.

And I could argue if someone would say that the active area of an element should be as big as it's visual representation, but I'll keep my arguments on this topic for another article.

## Arguments against changing the cursor

…