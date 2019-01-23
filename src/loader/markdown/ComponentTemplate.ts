
import * as fs from 'fs';
import * as path from 'path';

const CHILDREN_PLACEHOLDER = '{ PLACEHOLDER }';

const template = loadTemplate();
if (template.indexOf(CHILDREN_PLACEHOLDER) === -1) {
  throw new Error(`template does not contain placeholder for children: ${CHILDREN_PLACEHOLDER}`);
}

export class ComponentTemplate {
  compile(source : string) {
    return template.replace(CHILDREN_PLACEHOLDER, source);
  }
}

export default ComponentTemplate;

function loadTemplate() {
  return fs.readFileSync(path.join(__dirname, './MarkdownPage.tsx')).toString('utf8');
}
