# Legends and Headings

One day in the last december I tried to find out what we can do with the `legend` element. I wanted to move it in the fieldset’s frame, and didn’t want to style it out ’cause the fieldsets with legend have this special behavior: the fieldset’s border gets the gap for the legend to fit in.

So, I made some tricks to emulate different behaviors: move the legend to the right, center or even make visually two legends in one fieldset.

The easiest part is the positioning of the legend to the right: use the `direction: rtl` and the position of the legend would adjuct accordingly. And don’t forget to bring back the `ltr` direction on the child elements.

For the centered and the double one I used a hack with extra elements and stretched legend. There could be pseudos instead of some extra elements, but there were some bugs with them there, so I just used the extras here. Of course it’s not that «fair», but you can style it so it would look like borders, so… Here is a dabblet with those fieldsets and legends:

[partial:legends]

And there is a simplier demo of the headings with rulers on the sides. The main point is to use only one element and to make the borders somewhat «fair», so if there would be a background, there would be visual gaps. Other similar methods I saw used the fake background on the centered item to cover the line under it.

It’s sad that you can’t do multiline variant using only one element — so in that case there is one extra span. In other cases there is only the header and the pseudos — and it must degrade gracefully. So here is it’s dabblet:

[partial:headings]
