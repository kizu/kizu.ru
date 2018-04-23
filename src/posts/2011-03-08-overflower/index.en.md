# Text-overflow emulation and gradient overflow

1. The «overflow» effect is visible only if there is something to hide (so, there wouldn’t be a case when there is an overlayed gradient that hides a part of text, that would be visible whole anyway).
2. Also, you can add a `title` attribute to a block, that would appear only when something is hidden.
3. You can use this method starting from the IE7 (however, I hadn’t optimise it for this experiment, so barely only title would be visible)

Resize the browser’s window to see the switching of overflow effect.

{{<Partial "overflower.html" />}}
