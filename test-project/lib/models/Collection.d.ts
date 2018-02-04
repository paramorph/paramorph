import Page from './Page';
import Layout from './Layout';
export default class Collection {
    title: string;
    layout: Layout;
    output: boolean;
    pages: Page[];
    constructor(title: string, layout: Layout, output: boolean);
}