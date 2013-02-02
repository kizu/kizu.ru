{% capture strip_whitespace %}
# This file contains all the magic for the overloading of the Jekyll

Here we getting the language from url

    {% assign lang = "ru" %}
    {% assign lang_prefix = "" %}

    {% if page.categories contains 'en' or page.url contains '/en/' %}
        {% assign lang = "en" %}
        {% assign lang_prefix = "en/" %}
    {% endif %}

Getting the title

    {% include get_title.md %}

Applying the references and hacking the start of the markdown for the content

    {% capture processed_content %}
    {{ processed_content }}{% include references.md %}{% endcapture %}

Capturing the category

    {% capture category %}{% if lang == "en" %}{{ page.categories[1] }}{% else %}{{ page.categories[0] }}{% endif %}{% endcapture %}

Markdownify the processed content

{% endcapture %}
