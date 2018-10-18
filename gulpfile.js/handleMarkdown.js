const shell = require('shelljs');
const yamlFront = require('yaml-front-matter');
const log = require('fancy-log');

// Do want `xregexp` here
const pathsParts = {
  'start': '^',
  'path': '((?:[^\/]+\/)*)?',             // like `foo/bar/`
  'date': '(?:(\\d{4}-\\d{2}-\\d{2})-)?', // like `2015-12-02`
  'categories': '(\\([^\\)]+\\)-)?',      // like `(issues old)`
  'notIndex': '(?!(?!^)index)',
  'slug': '([^\/\\.\\_]+)',      // like `whatever-title`
  'isInFolder': '(?:\/(index))?',         // like `/index`
  'lang': '(?:\\.(\\w{2}))?',             // like `en`
  'extensions': '((?:\\.[^\\.\\/]+)+)',   // like `.md`
  'end': '$'
};

const pathRegexp = new RegExp([
  pathsParts.start,
  pathsParts.path,
  pathsParts.date,
  pathsParts.categories,
  pathsParts.notIndex,
  pathsParts.slug,
  pathsParts.isInFolder,
  pathsParts.lang,
  pathsParts.extensions,
  pathsParts.end
].join(''));

const handleMarkdown = (initialContent, relativePath, fileBase) => {
  let content = initialContent;

  // Handle markdown documents
  const pathMatch = relativePath.match(/\.md|\.odt$/);
  if (pathMatch) {
    let metadata = {};
    metadata.type = fileBase.match(/\/(\w+)s$/)[1];

    const pathMatchData = relativePath.match(pathRegexp);
    if (pathMatchData) {
      const pathData = {
        directory: pathMatchData[1],
        date: pathMatchData[2],
        categories: pathMatchData[3],
        slug: pathMatchData[4],
        lang: pathMatchData[6],
        extension: pathMatchData[7]
      };

      if (pathData.slug && metadata.type && metadata.type === 'post') {
        metadata.slug = pathData.slug;
      }
      if (pathData.directory) {
        if (pathData.directory === 'drafts/') {
          metadata.draft = true;
        }
      }
      if (pathData.date) {
        metadata.date = pathData.date;
      }

      if (pathData.lang) {
        metadata.lang = pathData.lang;
      }

      metadata.originalPath = fileBase.replace(/^.+\/src\//, '') + '/' + relativePath;

      metadata.srcPath = 'content/posts/';
      metadata.srcPath += pathMatchData[1] || '';
      metadata.srcPath += pathMatchData[2] && pathMatchData[2] + '-' || '';
      metadata.srcPath += pathMatchData[3] || '';
      metadata.srcPath += pathMatchData[4] || '';
      metadata.srcPath += '/';
      const fileMetadataPath = `${fileBase}${metadata.srcPath.replace('content/posts/', '/')}_data.json`;
      if (shell.test('-e', fileMetadataPath)) {
        fileMetadata = JSON.parse(shell.cat(fileMetadataPath));
        metadata = Object.assign(metadata, fileMetadata);
      }
    }

    if (content[0] === '-') {
      const yamlMetadata = yamlFront.loadFront(content);
      content = yamlMetadata.__content.trim();
      delete yamlMetadata.__content;
      metadata = Object.assign(metadata, yamlMetadata);
    }

    // Create aliases automatically
    if (metadata.type && metadata.type === 'post' && !metadata.categories) {
      metadata.categories = ['blog']
    }
    const postDate = new Date(metadata.date);
    // Only create aliases for articles before march 2018.
    if (postDate && (postDate.getFullYear() < 2018) || postDate.getMonth() < 2) {
      metadata.aliases = metadata.aliases || [];
      const autoAlias = (metadata.lang === 'ru' ? '/' : `/${metadata.lang}/`) + metadata.categories.join('/') + `/${metadata.slug}/`;
      if (metadata.aliases.indexOf(autoAlias) === -1) {
        metadata.aliases.push(autoAlias);
      }
    }

    // Handle case when there is no metadata
    // TODO: handle case with metadata
    //       Possibly by grabbing it, converting to js object
    //       and then filling up later?
    const titleMatch = content.match(/^\#+ +(.+)/);
    if (titleMatch) {
      metadata.title = titleMatch[1];
      content = content.replace(titleMatch[0], '');
    } else {
      const title2Match = content.match(/^(.+)\n=+/);
      if (title2Match) {
        metadata.title = title2Match[1];
        content = content.replace(title2Match[0], '');
      }
    }

    // Tags
    const tagsMatch = content.match(/\n\#([^#\s].+)\n/);
    if (tagsMatch) {
      metadata.tags = tagsMatch[1].split(/\s+#/);
      content = content.replace(tagsMatch[0], '');
    }

    if (metadata.categories && metadata.categories.indexOf('old') !== -1) {
      metadata.tags.push('Outdated');
    }

    // Summary
    const summaryMatch = content.match(/^\s*_(.+)_\n/);
    if (summaryMatch) {
      metadata.summary = summaryMatch[1];
      content = content.replace(summaryMatch[0], '');
    }

    // Warning
    const warningMatch = content.match(/^\s*\*\*(.+)\*\*\n/);
    if (warningMatch) {
      metadata.warning = warningMatch[1];
      content = content.replace(warningMatch[0], '');
    }

    // Convert md footnotes to sidenote shortcodes
    // Sidelink
    content = content.replace(/([\wА-Яа-я '’“”«»]+)\[\^([^\]]+)\]/g, '{{<Sidelink "$2" "$1" />}}');
    // Sidenotes Item
    content = content.replace(/\n[ ]+\[\^([^\]]+)\]:((?:(?!<!--).)+)[ ]*(?:<!--\s*(.*\S)\s*-->)?/g, '\n{{<SidenotesItem id="$1" $3>}}$2{{</SidenotesItem>}}');
    // Sidenote
    content = content.replace(/\n\[\^([^\]]+)\]:((?:(?!<!--).)+)[ ]*(?:<!--\s*(.*\S)\s*-->)?/g, '\n{{<Sidenote id="$1" $3>}}$2{{</Sidenote>}}');

    // Output metadata as json at the start of content
    content = JSON.stringify(metadata) + '\n' + content;
    // console.log(metadata)
  }
  return content;
};


module.exports = handleMarkdown;
