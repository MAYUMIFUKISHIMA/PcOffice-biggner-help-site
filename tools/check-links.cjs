// Run with Node.js from any directory. No dependencies.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../excel-help');
const pages = fs.readdirSync(root, { recursive: true }).filter(p => p.endsWith('.html'));
const problems = [];
for (const page of pages) {
  const current = path.join(root, page);
  const html = fs.readFileSync(current, 'utf8');
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const [file, fragment] = ref.split('#');
    const target = file ? path.resolve(path.dirname(current), file) : current;
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) {
      problems.push(page + ' -> ' + ref);
    } else if (fragment && !fs.readFileSync(target,'utf8').includes('id="' + fragment + '"')) {
      problems.push(page + ' -> missing #' + fragment);
    }
  }
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log(pages.length + ' pages: all local targets and anchors exist.');
}
