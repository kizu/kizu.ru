// @ts-check

const initWebComponents = () => {
  const postsCache = new Map();

  const pluralized = {
    replies: {
      one: 'reply',
      other: 'replies',
    },
    reblogs: {
      one: 'boost',
      other: 'boosts',
    },
    favourites: {
      one: 'favorite',
      other: 'favorites',
    },
  }

  class MastodonPostInfo extends HTMLElement {
    constructor() {
      super();
        this.attachShadow({ mode: 'open' });
        const template = document.getElementById('mastodon-post-info-template');
        if (!(template instanceof HTMLTemplateElement)) {
          return;
        }
        this.shadowRoot?.appendChild(template?.content.cloneNode(true));
    }

    updateContent(data) {
      const fields = this.shadowRoot?.querySelectorAll('[data-field]');
      if (!fields) {
        return;
      }
      for (const field of fields) {
        if (!(field instanceof HTMLElement)) {
          continue;
        }
        const name = field.dataset.field;
        const count = data[`${name}_count`];
        if (!count) {
          continue;
        }
        const label = pluralized[name][new Intl.PluralRules("en").select(count)];
        field.textContent = `${count} ${label}`;
      }
    }

    connectedCallback() {
      const link = this.querySelector('a');
      if (!link) {
        return;
      }
      const url = new URL(link.href);
      const instance = url.origin;
      const postId = url.pathname.split('/').pop();

      const cachedData = postsCache.get(postId);
      if (cachedData) {
        this.updateContent(cachedData);
        return;
      }

      const observer = new IntersectionObserver((entries, self) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            fetch(`${instance}/api/v1/statuses/${postId}`)
            .then(response => response.json())
            .then(data => {
              postsCache.set(postId, data);
              this.updateContent(data);
            })
            .catch(error => {
              console.error('Failed to fetch Mastodon post information:', error);
            });
            self.disconnect();
          }
        }
      }, {});
      observer.observe(link);
    }
  }

  customElements.define('mastodon-post-info', MastodonPostInfo);
};

export default initWebComponents;
