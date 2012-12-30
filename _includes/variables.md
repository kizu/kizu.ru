{% assign lang = "ru" %}
{% assign lang_prefix = "" %}
{% if page.categories contains 'en' %}
    {% assign lang = "en" %}
    {% assign lang_prefix = "en/" %}
{% endif %}
