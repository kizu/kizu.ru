{% assign lang = "ru" %}
{% assign lang_prefix = "" %}

{% if page.categories contains 'en' or page.url contains '/en/' %}
    {% assign lang = "en" %}
    {% assign lang_prefix = "en/" %}
{% endif %}

{% capture category %}{% if lang == "en" %}{{ page.categories[1] }}{% else %}{{ page.categories[0] }}{% endif %}{% endcapture %}

{% include references.md %}
