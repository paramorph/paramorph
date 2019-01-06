
import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';

import { Router } from '../router';
import { History } from 'history';

import { default as DefaultRoot, RootProps } from '../components/Root';
import { Paramorph, Page } from '../model';
import { ContextContainer } from '../react';

export interface Locals {
  Root ?: React.ComponentType<RootProps>;
  js ?: string[];
  css ?: string[];
}

export class ServerRenderer {
  constructor(
    private history : History,
    private router : Router,
    private paramorph : Paramorph
  ) {
  }

  async render(locals : Locals, assets : HashMap<any>) : Promise<HashMap<string>> {
    const { paramorph, history, router } = this;

    const Root = locals.Root || DefaultRoot;
    const rootProps = this.getRootProps(locals, assets);

    const pages = Object.keys(paramorph.pages)
      .map(key => paramorph.pages[key] as Page)
    ;
    const result = {} as HashMap<string>;

    await Promise.all(pages.map(async (page : Page) => {
      // react root contents rendered with react ids
      const { LayoutComponent, PageComponent } = await router.resolve(page.url);

      const pageElement = React.createElement(PageComponent);
      const layoutElement = React.createElement(LayoutComponent, {}, pageElement);

      const props = { history, paramorph, page };
      const app = React.createElement(ContextContainer, props, layoutElement);
      const body = ReactDomServer.renderToString(app);

      // site skeleton rendered without react ids
      const root = React.createElement(Root, { ...rootProps, page });
      const html = ReactDomServer.renderToStaticMarkup(root);

      result[page.url] = '<!DOCTYPE html>\n' + html.replace("%%%BODY%%%", body);
    }));

    return result;
  }

  private getRootProps(locals : Locals, assets : HashMap<any>) {
    const { paramorph } = this;
    const assetUrls = Object.keys(assets)
      // filtering out static generator entry point
      .filter(url => !url.match(/^server-.*\.js$/))
      // filtering out async bundles
      .filter(url => !url.match(/^[0-9]+-.*\.js$/))
      .map(url => `/${url}`)
    ;
    return {
      localBundles: {
        css: assetUrls.filter(value => value.match(/\.css$/)),
        js: assetUrls.filter(value => value.match(/\.js$/)),
      },
      externalBundles: {
        css: locals.css || [],
        js: locals.js || [],
      },
      paramorph,
    };
  }
}

export default ServerRenderer;

export interface HashMap<T> {
  [name : string] : T | undefined;
}

