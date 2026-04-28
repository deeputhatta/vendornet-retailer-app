const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  const original = c;
  c = c.replace(/\[([^\]]+)\]\(http:\/\/[^\)]+\)/g, '$1');
  if (c !== original) {
    fs.writeFileSync(filePath, c);
    return true;
  }
  return false;
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  let fixed = 0;
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && f !== 'node_modules') {
      fixed += walk(full);
    } else if (f.endsWith('.js')) {
      if (fixFile(full)) { console.log('Fixed:', full); fixed++; }
    }
  }
  return fixed;
}

const total = walk('src');
console.log('Total files fixed:', total);
