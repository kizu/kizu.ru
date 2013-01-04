---
title: Ololo en!

layout: index

permalink: /en/

categories: en

---

Oh hi, I'm here!

{% for post in site.posts %}{% if post.categories contains 'en' %}- [{{ post.title }}]({{ post.url }}/) {{ post.date | date: "%d %B, %Y" }}{% endif %}
{% endfor %}
