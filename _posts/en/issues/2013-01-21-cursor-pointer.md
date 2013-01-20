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

### UI Feedback

…