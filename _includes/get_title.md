# Trying to get the title from the markdown content

    {% assign processed_content = page.content %}

I couldn't find any other way to strip by newlines except using the `newline_to_br`:

    {% assign content_lines = processed_content | newline_to_br | split:'<br />' %}

Check if the first line contains `# `, then if so, then set the title to the found string

    {% if content_lines[0] contains '# ' %}
        {% assign processed_content = processed_content | remove_first:content_lines[0] %}
        {% capture processed_title %}{{ content_lines[0] | remove_first:"# " | markdownify | remove:"<p>" | remove:"</p>" }}{% endcapture %}
    {% else %}
        {% capture processed_title %}{{ page.title }}{% endcapture %}
    {% endif %}
