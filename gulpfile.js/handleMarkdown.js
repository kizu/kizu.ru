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

const handleMarkdown = (initialContent, relativePath) => {
  let content = initialContent;

  // Handle markdown documents
  const pathMatch = relativePath.match(/\.md|\.odt$/);
  if (pathMatch) {
    let metadata = {};

    const pathMatchData = relativePath.match(pathRegexp);
    const pathData = {
      directory: pathMatchData[1],
      date: pathMatchData[2],
      categories: pathMatchData[3],
      slug: pathMatchData[4],
      lang: pathMatchData[6],
      extension: pathMatchData[7]
    };

    if (pathData.slug) {
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

    metadata.srcPath = 'posts/';
    metadata.srcPath += pathMatchData[1] || '';
    metadata.srcPath += pathMatchData[2] && pathMatchData[2] + '-' || '';
    metadata.srcPath += pathMatchData[3] || '';
    metadata.srcPath += pathMatchData[4] || '';
    metadata.srcPath += '/';

    const fileMetadataPath = `${metadata.srcPath}data.json`;
    if (shell.test('-e', fileMetadataPath)) {
      fileMetadata = JSON.parse(shell.cat(fileMetadataPath));
      metadata = Object.assign(metadata, fileMetadata);
    }

    if (content[0] === '-') {
      const yamlMetadata = yamlFront.loadFront(content);
      content = yamlMetadata.__content.trim();
      delete yamlMetadata.__content;
      metadata = Object.assign(metadata, yamlMetadata);
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

    // Convert md footnotes to sidenote shortcodes
    // Sidelink
    content = content.replace(/([\w '’“”«»]+)\[\^([^\]]+)\]/g, '{{<Sidelink "$2" "$1" />}}');
    // Sidenote
    content = content.replace(/\n\[\^([^\]]+)\]:((?:(?!<!--).)+)[ ]*(?:<!--\s*(.*\S)\s*-->)?/g, '\n{{<Sidenote id="$1" $3>}}$2{{</Sidenote>}}');
    // Sidenotes Item
    content = content.replace(/\n[ ]+\[\^([^\]]+)\]:((?:(?!<!--).)+)[ ]*(?:<!--\s*(.*\S)\s*-->)?/g, '\n{{<SidenotesItem id="$1" $3>}}$2{{</Sidenote>}}');


    // Typography for markdown
    // (right now its not that safe, need custom solution for applying it for text nodes only)
    // content = content.replace(
    //   /([^А-Яа-яA-Za-z]*)([А-Яа-яA-Za-z].+)/g,
    //   (match, prefix, text) => prefix + richtypo.full(text, pathData.lang || 'ru')
    // );

    // Output metadata as json at the start of content
    content = JSON.stringify(metadata) + '\n' + content;
    // console.log(metadata)
  }
  return content;
};


module.exports = handleMarkdown;
