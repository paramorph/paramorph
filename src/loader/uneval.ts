
import { Paramorph, Layout, Include, Page, Category, Tag } from '..';

export function uneval(paramorph : Paramorph, varName : string = 'paramorph') : string {
  const layouts = Object.keys(paramorph.layouts)
    .map(key => paramorph.layouts[key] as Layout);
  const includes = Object.keys(paramorph.includes)
    .map(key => paramorph.includes[key] as Layout);

  const pages : Page[] = [];
  const categories : Category[] = [];
  const tags : Tag[] = [];

  const all = Object.keys(paramorph.pages)
    .map(key => paramorph.pages[key] as Page);

  all.forEach(page => {
    switch (page.constructor) {
      case Page:
        pages.push(page);
        return;
      case Category:
        categories.push(page as Category);
        return;
      case Tag:
        tags.push(page as Tag);
        return;
      default:
        console.warn(`found a page of unknown type: ${page.constructor}`);
        pages.push(page);
        return;
    }
  });

  const categoryTuples = [].concat.apply([],
    all.map(({ url, categories } : Page) => categories.map(category => ({ category, url }))),
  ) as { category : string, url : string }[];
  const tagTuples = [].concat.apply([],
    all.map(({ url, tags } : Page) => tags.map(tag => ({ tag, url }))),
  ) as { tag : string, url : string }[];

  return `// GENERATED BY PARAMORPH //

// CONFIG //
const config = ${JSON.stringify(paramorph.config, null, 2)};

// PARAMORPH //
const ${varName} = new Paramorph(config);

// LAYOUTS //
${
  layouts
    .map(layout => `${varName}.addLayout(\n${unevalLayout(layout)}\n);\n`)
    .join('')
}
// INCLUDES //
${
  includes
    .map(include => `${varName}.addInclude(\n${unevalInclude(include)}\n);\n`)
    .join('')
}
// PAGES //
${
  pages
    .map(page => `${varName}.addPage(\n${unevalPage(page)}\n);\n`)
    .join('')
}
// CATEGORIES //
${
  categories
    .map(category => `${varName}.addPage(\n${unevalCategory(category)}\n);\n`)
    .join('')
}
// PAGES IN CATEGORIES //
${
  categoryTuples
    .map(t => `${varName}.categories["${t.category}"].pages.push(${varName}.pages["${t.url}"]);\n`)
    .join('')
}
// TAGS //
${
  tags
    .map(tag => `${varName}.addPage(\n${unevalTag(tag)}\n);\n`)
    .join('')
}
// PAGES IN TAGS //
${
  tagTuples
    .map(t => `${varName}.tags["${t.tag}"].pages.push(${varName}.pages["${t.url}"]);\n`)
    .join('')
}
// LAYOUT LOADERS //
${
  layouts
    .map(layout => `${varName}.addLayoutLoader("${layout.name}", ${loaderOf(layout.path)});\n`)
    .join('')
}
// INCLUDE LOADERS //
${
  includes
    .map(include => `${varName}.addIncludeLoader("${include.name}", ${loaderOf(include.path)});\n`)
    .join('')
}
// PAGE LOADERS //
${
  all
    .map(page => `${varName}.addPageLoader("${page.url}", ${loaderOf(page.source)});\n`)
    .join('')
}
`;
}

export default uneval;

export function unevalLayout(layout : Layout) {
  return `  new Layout(\n    ${
    JSON.stringify(layout.name)
  },\n    ${
    JSON.stringify(layout.path)
  },\n  )`;
}

export function unevalInclude(include : Include) {
  return `  new Include(\n    ${
    JSON.stringify(include.name)
  },\n    ${
    JSON.stringify(include.path)
  },\n  )`;
}

export function unevalPage(page : Page) {
  return `  new Page(\n    ${
    JSON.stringify(page.url)
  },\n    ${
    JSON.stringify(page.title)
  },\n    ${
    JSON.stringify(page.description)
  },\n    ${
    JSON.stringify(page.image)
  },\n    ${
    JSON.stringify(page.collection)
  },\n    ${
    JSON.stringify(page.layout)
  },\n    ${
    JSON.stringify(page.source)
  },\n    ${
    JSON.stringify(page.output)
  },\n    ${
    JSON.stringify(page.feed)
  },\n    ${
    JSON.stringify(page.categories)
  },\n    ${
    JSON.stringify(page.tags)
  },\n    ${
    JSON.stringify(page.timestamp)
  },\n  )`;
}

export function unevalCategory(page : Category) {
  return `  new Category(\n    ${
    JSON.stringify(page.url)
  },\n    ${
    JSON.stringify(page.title)
  },\n    ${
    JSON.stringify(page.description)
  },\n    ${
    JSON.stringify(page.image)
  },\n    ${
    JSON.stringify(page.collection)
  },\n    ${
    JSON.stringify(page.layout)
  },\n    ${
    JSON.stringify(page.source)
  },\n    ${
    JSON.stringify(page.output)
  },\n    ${
    JSON.stringify(page.feed)
  },\n    ${
    JSON.stringify(page.categories)
  },\n    ${
    JSON.stringify(page.tags)
  },\n    ${
    JSON.stringify(page.timestamp)
  },\n  )`;
}

export function unevalTag(page : Tag) {
  return `  new Tag(\n    ${
    JSON.stringify((page as Tag).originalTitle)
  },\n    ${
    JSON.stringify(page.description)
  },\n    ${
    JSON.stringify(page.image)
  },\n    ${
    JSON.stringify(page.layout)
  },\n    ${
    JSON.stringify(page.source)
  },\n    ${
    JSON.stringify(page.output)
  },\n    ${
    JSON.stringify(page.timestamp)
  },\n  )`;
}

export function loaderOf(path : string) {
  return `() => import("@website${path.substring(1)}")`;
}

