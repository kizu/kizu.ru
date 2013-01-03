---
layout: index
title: Ololo!
---
{% include references.md %}

Привет. Я работаю разработчиком интерфейсов в [Яндексе][yndx] и иногда как-нибудь участвую в жизни сообщества [__ Веб-стандарты __][wst]{:quoted}


{% for post in site.posts %}{% unless post.categories contains 'en' or post.categories contains 'old' %}- [{{ post.title }}]({{ post.url }}/) {{ post.date | date: "%d %B, %Y" }}{% endunless %}
{% endfor %}
