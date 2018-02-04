/// <reference types="react" />
import { Website, Page } from '../models';
export interface BundleUrls {
    css: string[];
    js: string[];
}
export interface RootProps {
    website: Website;
    page: Page;
    localBundles: BundleUrls;
    externalBundles: BundleUrls;
}
export declare function Root({website, page, localBundles, externalBundles}: RootProps): JSX.Element;
export default Root;