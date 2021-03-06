
import * as webpack from 'webpack';
import * as utils from 'loader-utils';
import * as path from 'path'

import FileSystem from '../../platform/node/FileSystem';
import ErrorPolicy from '../../ErrorPolicy';

import ConfigParser from './ConfigParser';
import ConfigLoader from './ConfigLoader';
import ProjectStructure from './ProjectStructure';
import FrontMatter from './FrontMatter';
import PostFactory from './PostFactory';
import FullContentLoader from './FullContentLoader';

import sitemap from './sitemap';
import rss from './rss';
import uneval from './uneval';

export = loader;

const NO_DEBUG = {
  generatedDescriptions: false,
  generatedImages: false,
};
const FULL_DEBUG = {
  generatedDescriptions: true,
  generatedImages: true,
};

function loader(this : webpack.loader.LoaderContext, source : string, map : any) {
  this.cacheable && this.cacheable();
  const callback = this.async() as webpack.loader.loaderCallback;

  const options = {
    debug: false,
    policy: {},
    ...(utils.getOptions(this) || {}),
  };
  const policy = {
    missingDescription: 'error' as ErrorPolicy,
    missingImage: 'ignore' as ErrorPolicy,
    ...options.policy,
  };
  const debug = options.debug === false
    ? NO_DEBUG
    : (
      options.debug === true
      ? FULL_DEBUG
      : {
        ...NO_DEBUG,
        ...(options.debug || {})
      }
    )
  ;

  const fs = new FileSystem();
  const parser = new ConfigParser();

  const loader = new ConfigLoader(
    new ProjectStructure(fs),
    new FrontMatter(fs),
    new PostFactory(),
    new FullContentLoader(this, policy, debug)
  );

  const self = this;

  loader.load(parser.parse(source))
    .then(paramorph => {
      Object.keys(paramorph.posts)
        .map(url => path.join(process.cwd(), url))
        .forEach(url => this.addDependency(url))
      ;

      const feed = rss(paramorph);
      self.emitFile('feed.rss', feed, null);
      self.emitFile('rss.xml', feed, null);
      self.emitFile('sitemap.xml', sitemap(paramorph), null);

      const source = 'const { Paramorph, Layout, Include, Post, Collection, Category, Tag } '
        +'= require(\'paramorph/model\');\n'
        + uneval(paramorph, 'paramorph')
        +';\nmodule.exports.default = paramorph;\n'
      ;
      callback(null, source, map);
    })
    .catch(err => {
      callback(err);
    })
  ;
};

