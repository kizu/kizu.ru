---
layout: index
title: Ololo!
---

Привет. Я работаю разработчиком интерфейсов в [Яндексе][yndx] и иногда как-нибудь участвую в жизни сообщества [<span class="link__inner">Веб-стандарты</span>][wst]{:quoted}

{% include references.md %}

{% for post in site.posts %}{% unless post.categories contains 'en' or post.categories contains 'old' %}- [{{ post.title }}]({{ post.url }}/) {{ post.date | date: "%d %B, %Y" }}{% endunless %}
{% endfor %}
