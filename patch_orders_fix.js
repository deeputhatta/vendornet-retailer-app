const fs = require('fs');
let c = fs.readFileSync('./src/screens/OrdersScreen.js', 'utf8');

// Fix the broken invoice button text
c = c.replace(
  /\{View Invoice\\[^}]+\}/g,
  `'View Invoice \u2192'`
);

// Fix the broken emoji
c = c.replace(
  /\{'[^']*'\}(\s*<\/Text>\s*<Text[^>]*invoiceBtnText)/,
  `{'\uD83E\uDDFE'}$1`
);

// More targeted fix - replace entire invoice button content
c = c.replace(
  /<Text style={styles\.invoiceBtnIcon}>[^<]*<\/Text>\s*<Text style={\[styles\.invoiceBtnText[^\]]*\][^}]*}>[^<]*<\/Text>/,
  `<Text style={styles.invoiceBtnIcon}>🧾</Text>\n            <Text style={[styles.invoiceBtnText, { color: '#30D158' }]}>View Invoice →</Text>`
);

fs.writeFileSync('./src/screens/OrdersScreen.js', c);
console.log('Fixed');

// Show the fixed section
const lines = c.split('\n');
const idx = lines.findIndex(l => l.includes('invoiceBtnIcon'));
if (idx > -1) console.log(lines.slice(idx-1, idx+4).join('\n'));
