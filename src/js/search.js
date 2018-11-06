const searchScriptSrc = "https://cdn.jsdelivr.net/npm/instantsearch.js@2.10.2";

const isSearchPage = !!document.URL.match(/\/search\//);
const pageLang = document.documentElement.lang || "en";

const i18n = {
  en: {
    searchBy: "Search by",
    noResults: "Nothing found.",
    emptyQuery: "Please, enter anything into the above search field."
  },
  ru: {
    searchBy: "Поиск от",
    noResults: "Ничего не найдено.",
    emptyQuery: "Пожалуйста, введите что-нибудь в поисковое поле."
  }
}[pageLang];

const searchParams = t => ({
  appId: 'QY1NHMZSE7',
  apiKey: 'ba4f380d8e3c51fd18b73958104cc906',
  indexName: 'kizu.ru', // Find a way to pass the lang context

  routing: isSearchPage,
  searchParameters: {
    facetsRefinements: {
      lang: [pageLang]
    },
  }
});

const searchBoxWidget = where => ({
  container: `${where} .Search-Form`,
  magnifier: false,
  wrapInput: false,
  reset: false,
  cssClasses: {
    input: 'Search-Input'
  },
  placeholder: ' ',
  poweredBy: {
    template: `
    <span class="Search-PoweredBy">
      — ${i18n.searchBy}
      <a href="{{url}}" target="_blank" tabindex="-1"><img class="AlgoliaSVG" src="/i/algolia.svg" alt="Algolia" width="93" height="23" /></a>
    </div>`
  }
});

const hitsWidget = where => ({
  container: `${where} .Search-Results`,
  escapeHits: false,
  transformData: {
    allItems: results => {
      results.query = results.query.trim();
      results.hits.map((hit, index) => {
        const highlightedFields = [];
        if (index === 0) {
          hit.isFirst = true;
        }
        Object.keys(hit._highlightResult).map(prop => {
          const propData = hit._highlightResult[prop];
          const isHighlighed = !!(
            propData.length
              ? propData.filter(item => item.matchedWords && item.matchedWords.length) : propData.matchedWords
            ).length;
          propData.isHighlighted = isHighlighed;
          if (isHighlighed) {
            highlightedFields.push(prop);
            if (!propData.length && (prop === 'content' || prop === 'summary')) {
              propData.value = propData.value
                .replace(/:\n/g, ': ')
                .replace(
                  /^([^<>\.?!\n]+(?:[\.?!]\s+)|\n)*(.*\<[^\.?!\n]+[\.?!\n])[\s\S]+$/,
                  '$2'
                )
                .replace(/\n/g, " ")
                .replace(
                  /<\/mark>([^<>]+)/g,
                  '</mark><span class="Search-Result-Text-After">$1</span>'
                )
                .replace(
                  /([^<>]+)<mark>/g,
                  '<span class="Search-Result-Text-Before">$1</span><mark>'
                );
            }
          }
        });
        // Totally could be done more effectively, just a quick proof of concept
        hit.shownFields = {};
        if (hit._highlightResult.subtitle.value) {
          hit.shownFields.subtitle = true;
        }
        if (results.query.length > 2) {
          if (highlightedFields.indexOf('title') === -1 && highlightedFields.indexOf('subtitle') === -1) {
            if (highlightedFields.indexOf('summary') !== -1) {
              hit.shownFields.summary = true;
            } else if (highlightedFields.indexOf('content') !== -1) {
              hit.shownFields.content = true;
            }
          }
          if (highlightedFields.indexOf('tags') !== -1) {
            hit.shownFields.tags = true;
            hit._highlightResult.tags.map(tag => {
              tag.shown = tag.matchedWords.length;
            });
          }
        }
      });
      return results;
    }
  },
  templates: {
    empty: i18n.noResults,
    allItems: `
      {{^query}}
        <p>${i18n.emptyQuery}</p>
      {{/query}}
      {{#query}}
        <ul class="Search-Results-List">
          {{#hits}}
            <li class="Search-Results-List-Item{{#isFirst}} isActive{{/isFirst}}">
              <article class="Search-Result">
                <h3 class="Search-Result-Title">
                  <a class="Search-Result-Link{{^shownFields.subtitle}} Search-Result-Link_main{{/shownFields.subtitle}}" href="{{relpermalink}}">{{& _highlightResult.title.value}}</a>
                  {{#shownFields.subtitle}}
                    &gt;
                    <a class="Search-Result-Link Search-Result-Link_main" href="{{relpermalink}}{{hash}}">{{& _highlightResult.subtitle.value}}</a>
                  {{/shownFields.subtitle}}
                  {{#shownFields.tags}}
                    <span class="Search-Result-Tags TagList">
                      {{#_highlightResult.tags}}
                        {{#shown}}
                          #{{& value }}
                        {{/shown}}
                      {{/_highlightResult.tags}}
                    </span>
                  {{/shownFields.tags}}
                </h3>
                {{#shownFields.content}}
                  <p class="Search-Result-Text">{{& _highlightResult.content.value}}</p>
                {{/shownFields.content}}
                {{#shownFields.summary}}
                  <p class="Search-Result-Text">{{& _highlightResult.summary.value}}</p>
                {{/shownFields.summary}}
              </article>
            </li>
          {{/hits}}
        </ul>
      {{/query}}
    `
  }
});

const mySearch = {
  searchInitialized: false,
  searchContext: null,
  contextElement: null,

  handleKeyNav: function(options) {
    const { key, context } = options;
    const currentItem =
      context === 'item'
        && document.activeElement.closest('.Search-Results-List-Item') ||
      context === 'input'
        && document.activeElement.closest('.Search').querySelector('.Search-Results-List-Item.isActive');
    if (currentItem) {
      const prevItem = currentItem.previousElementSibling;
      const nextItem = currentItem.nextElementSibling;
      const contextItem =
        key === 'ArrowUp' && prevItem ||
        key === 'ArrowDown' && nextItem;
      if (contextItem && context === 'item') {
        contextItem.querySelector('.Search-Result-Link_main').focus();
      }
      if (contextItem && context === 'input') {
        currentItem.classList.remove('isActive');
        contextItem.classList.add('isActive');
      }
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();
    const firstItem = e.target.querySelector('.Search-Results-List-Item.isActive .Search-Result-Link_main');
    firstItem && firstItem.click();
    return false;
  },

  initInput: function() {
    this.input = this.contextElement.querySelector('.Search-Input');
    this.input.setAttribute('name', 'query');
    this.input.addEventListener('blur', () => {
      const target = this.contextElement.querySelector('.Search-Results-List-Item.isActive');
      target && target.classList.remove('isActive');
    }, false);
    this.input.addEventListener('focus', () => {
      target = this.contextElement.querySelector('.Search-Results-List-Item:first-child');
      target && target.classList.add('isActive');
    }, false);
  },

  resetSearch: function(sameButton) {
    this.search.dispose();
    const selector = sameButton ? '.SearchButton.isActive' : `body > :not(${this.searchContext}) .SearchButton.isActive` ;
    const button = document.querySelector(selector);
    if (button) {
      button.classList.remove('isActive');
    }
  },

  initSearch: function(func) {
    if (!this.searchInitialized) {
      this.searchInitialized = true;
      this.algoliaScript = document.createElement('script');
      this.algoliaScript.onload = () => {
        this.search = instantsearch(searchParams(this));
        this.search.start();
        func();
      };
      this.algoliaScript.src = searchScriptSrc;
      document.head.appendChild(this.algoliaScript);
    } else if (this.search) {
      this.resetSearch();
      func();
    }
  },

  focusSearch: function(where, button, event) {
    if (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey) {
        return;
      }
      event.preventDefault();
    }
    if (this.searchContext !== where) {
      this.searchContext = where;
      button && button.classList.add('isActive');
      this.contextElement = document.querySelector(`${where} > .Search`);
      this.initSearch(() => {
        this.search.addWidget(instantsearch.widgets.searchBox(searchBoxWidget(where)));
        this.search.addWidget(instantsearch.widgets.hits(hitsWidget(where)));
        this.initInput();
      });
    } else if (this.search) {
      this.resetSearch(true);
      this.searchContext = null;
      this.contextElement = null;
    }
  }
};

document.documentElement.classList.add("withSearch")

const getKey = event => {
  const key = event.key || event.keyCode;
  if (key === 'ArrowUp' || key === 38) {
    return 'ArrowUp';
  }
  if (key === 'ArrowDown' || key === 40) {
    return 'ArrowDown';
  }
}

const getCurrentContext = () => {
  const focusedEl = document.activeElement;
  const atInput = focusedEl && focusedEl.classList.contains('Search-Input');
  const atItem = focusedEl && focusedEl.classList.contains('Search-Result-Link');
  return atInput && 'input' || atItem && 'item';
}

const handleKeyEvent = (event, func) => {
  const context = getCurrentContext();
  const key = getKey(event);
  if (context && key) {
    func && func({ context, key });
    event.preventDefault();
  }
}

document.addEventListener('keydown', event => handleKeyEvent(event));
document.addEventListener('keyup', event => handleKeyEvent(event, mySearch.handleKeyNav));

if (isSearchPage) {
  mySearch.focusSearch('article');
}

module.exports = mySearch;
