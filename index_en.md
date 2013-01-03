---
title: Ololo en!

layout: index

permalink: /en/

categories: en

---

Oh hi, I'm here!

{% for post in site.posts %}{% unless post.categories contains 'en' or post.categories contains 'old' %}- [{{ post.title }}]({{ post.url }}/) {{ post.date | date: "%d %B, %Y" }}{% endunless %}
{% endfor %}
