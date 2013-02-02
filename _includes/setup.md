{% capture strip_whitespace %}
# This file contains all the magic for the overloading of the Jekyll

Now we must get the current page from posts, so all other thigngs would be the same as for any iterated posts.

    {% assign processed_post = false %}
    {% for post in site.posts %}
        {% if page.id == post.id %}
            {% assign processed_post = post %}
        {% endif %}
    {% endfor %}

Here we getting the language from url

    {% assign lang = "ru" %}
    {% assign lang_prefix = "" %}

    {% if page.categories contains 'en' or page.url contains '/en/' %}
        {% assign lang = "en" %}
        {% assign lang_prefix = "en/" %}
    {% endif %}

Getting the title

    {% include get_title.md %}

Capturing the category

    {% capture category %}{% if lang == "en" %}{{ page.categories[1] }}{% else %}{{ page.categories[0] }}{% endif %}{% endcapture %}

{% endcapture %}
