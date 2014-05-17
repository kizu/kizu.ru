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

Looking if the page have a translation

    {% if lang == 'en' %}
        {% capture expected_translation_id %}{{ page.id | replace:'/en/','/' }}{% endcapture %}
    {% else %}
        {% capture expected_translation_id  %}/en{{ page.id }}{% endcapture %}
    {% endif %}

    {% assign posts_ids = site.posts | map:'id' %}

    {% if page.page_type != 'post' or posts_ids contains expected_translation_id %}
        {% assign page_have_translation = true %}
    {% endif %}

Capturing the main category

    {% capture category %}{% if lang == "en" %}{{ page.categories[1] }}{% else %}{{ page.categories[0] }}{% endif %}{% endcapture %}

Trnsforming the sidenotes

    {% unless sidenotes_input or sidenotes_input == '' %}
        {% assign sidenotes_input = processed_content %}
    {% endunless %}
    {% include tenkan/sidenotes.md %}

    {% for sidenote_id in sidenotes_ids %}
        {% capture sidenote_replace %}<span class="sidenote-wrapper"><a class="sidenote-context" href="#{{ sidenote_id }}" id="{{ sidenote_id }}">{{ sidenotes_contexts[forloop.index0] }}</a><span class="sidenote"><span class="sidenote-misc"> (</span>{{ sidenotes_contents[forloop.index0] }}<span class="sidenote-misc">)</span></span><a class="sidenote-close" href="#x"></a></span>{% endcapture %}
        {% assign processed_content = processed_content | replace:sidenotes_id_strings[forloop.index0],sidenote_replace %}
    {% endfor %}
    {% assign sidenotes_input = '' %}

{% endcapture %}
