{% capture setup_cache %}

Including [Tenkan](https://github.com/kizu/tenkan)

    {% include tenkan/setup.md %}

Getting the language from url

    {% assign lang = "ru" %}
    {% assign lang_prefix = "" %}

    {% if page.categories contains 'en' or page.url contains '/en/' %}
        {% assign lang = "en" %}
        {% assign lang_prefix = "en/" %}
    {% endif %}

Capturing the main category

    {% capture category %}{% if lang == "en" %}{{ page.categories[1] }}{% else %}{{ page.categories[0] }}{% endif %}{% endcapture %}

{% endcapture %}
