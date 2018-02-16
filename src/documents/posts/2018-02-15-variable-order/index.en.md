# Variable Order

[Look](*disclaymer "**Important!** This is just an experiment, made in order to find what is possible to do _at all_ in CSS, this method is not meant for production, as it is bad for a11y.") at this table and note that you can click on its headers to sort the table by corresponding columns (and click again to change the ascending/descending order).

[partial:table]

This is done just with HTML and CSS, no JavaScript involved.

But how does this work?

## Inline CSS Variables

I was researching [CSS variables](*learn-more "If you'd want to learn more about CSS variables in general, I highly recommend you to watch [Lea Verou's talk about them](https://www.youtube.com/watch?v=UQRSaG1hQ20), she articulates really nicely a lot of nuances of their usage.") rather actively for the last 3 months, and initially I wanted to write a long article about just one aspect — CSS variables inside inline styles. But there were just so many things to write about, and I found a lot of general use-cases of variables (and not just for  inline ones), that I decided to split all my research into smaller articles.

This is an article about one of the examples from my research of CSS variables in inline styles, and as you could see from the example at the start — it is about _sorting_ stuff.

The main feature that makes that possible is that we can use CSS variables right inside the `style` attribute in HTML. And while it could be possible to define all the values for appropriate class names or nth-child-found elements, there is no need to do this when we can just add them to the corresponding HTML tags.

## The Sorting

[The code](*a11y "**Update:** one big problem with this method is that it can make UI less accessible due to reordering only visually. Thanks to [Thierry Kobientz](https://twitter.com/thierrykoblentz) and [Jen Simmons](https://twitter.com/jensimmons/status/964360059923742720) for bringing this up.") for our implementation of table sorting is not really complicated.

The only thing that we need to do in HTML (we use a regular HTML table for this, which later re-style with flex and grid) is an inline style for its rows which we sort:

    <tr
      class="table-row"
      style="
        --order-by-published: 161221;
        --order-by-views: 2431;
      ">
      <th class="table-cell">
        <a href="http://kizu.ru/en/fun/controlling-the-specificity/">Controlling the Specificity</a>
      </th>
      <td class="table-cell">2016-12-21</td>
      <td class="table-cell">2 431</td>
    </tr>
    {:.language-html}

You can see that the values for [those variables](*noname "You can notice that we don't have a variable to sort by name — we rely on DOM order for this.") there are just the date in `YYMMDD` [format](*edgebug "Not with YYYY, as in that case Edge would have [a bug](https://codepen.io/kizu/pen/MQObrW) there, so it seems that we shouldn't use numbers that big for `calc()` and `order`.") (so it becomes an integer) and the value for view.

For CSS, if I'll omit all the stuff that handles its presentation and UI for the table, the code behind the sorting itself becomes really small:

    .table-body {
      display: flex;
      flex-direction: column;
    }

    .table-row {
      order: calc(var(--order) * var(--sort-order, -1));
    }

    #sort-by-published:checked ~ .table > .table-body > .table-row {
      --order: var(--order-by-published);
    }

    #sort-by-views:checked ~ .table > .table-body > .table-row {
      --order: var(--order-by-views);
    }

    #sort-ascending:checked + .table {
      --sort-order: 1;
    }

    #sort-by-name:checked ~ #sort-ascending:checked + .table > .table-body {
      flex-direction: column-reverse;
    }
    {:.language-css}

This code covers sorting by three possible columns, and a global modifier to inverse the direction of the sorting. So, what happens there? 

1. The obvious key property for our solution is an `order`. When used inside flex or grid content, it defines the placement of an element in the flow.

2. For most of our columns, we would use a special variable that defines the direction of sorting: ascending or descending, this variable is `--sort-order` with a default value of `-1`, which makes elements with the bigger value to appear earlier in the flow than those with lower values. And when needed we can set it to `1` to inverse the order.

3. Then, we would define the `order` property using a calculation, in which we would use another variable alongside our direction: `calc(var(--order) * var(--sort-order, -1))`.

4. And by default, this variable is not set, so the value of this calc would fallback to `initial`. And this would make the content to appear in the order it is present in HTML: this way we don't need to introduce another variable and can use the DOM order for this.

5. Then, when needed (in our case — when we toggle an appropriate radio button, but in reality this could be done by toggling class names or setting the variable by any other condition), we set the `--order` variable used above to the one we want to use right now — so when we need to sort by one field, we use the variable for it, and for another field we use the second variable. This way if we'd need to add a fourth field which we could use for sorting, we would need to introduce just one new CSS rule.

6. And now as we say something like “use variable `--order-by-published` as a value for `--order` for each row”, the value would come from the inline style that we defined in HTML and all the elements would be automatically sorted accordingly. Yay!

7. And lastly, we need to handle an inverted direction case for our default DOM order. As we don't have variables for it which we could invert inside `calc`, we need to do something else — and I'm doing this by changing the `flex-direction` property to `column-reverse`. This works only for flex, and if we would have a grid, as far as I know, we would need to use a variable for our default sorting as well. But here we can cheat a bit.

## Caveats

- This solution works the best for anything that can be represented as an integer. In all the other cases we would need to first, on the HTML generation step, to somehow represent our value in integer. For some values its possible to do, for others — much harder. It is also possible to pre-sort our data per each field and instead of values, use their indexes for each field. But then the sorting itself still could be done just by very simple CSS. And don't forget that we always have the default DOM order for non-integer values: in my table, it is used for sorting the names in alphabetical order.

- We can't animate this sorting, as it uses the default layout mechanism and as long as the `order` is not animatable in CSS (or, more precisely, is animated in a discrete way), we can't do much. The ideal would be if the `order` could be animated by using the transition from its starting dimensions to its final ones, but we don't even have transitions for `auto` width & height, so we can't expect the same for `order` anytime soon (or maybe ever).

## Conclusion

I think this example shows how powerful CSS variables can be when used as a part of data: we can pre-fill some of the values which we won't use right away as some variables, and then later use them when needed. This can be used to sort lists, tables and any other stuff, and even to sort by multiple fields (though this would require a bit more code and couldn't be applied in _every_ case, I recommend you to try and implement this yourself).

This was the first article from my recent research of CSS variables, stay tuned and try to sort your stuff using just CSS and HTML in the meantime!
