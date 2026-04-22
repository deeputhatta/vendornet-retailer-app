const fs = require('fs');
let c = fs.readFileSync('./src/screens/ReportDownloadScreen.js', 'utf8');

c = c.replace(
  "{ icon: '\uD83D\uDCCA', title: 'Status & KPIs', desc: 'Status breakdown with key metrics' }",
  "{ icon: '\u23F3', title: 'Pending Orders', desc: 'All pending orders with days elapsed and products' }"
);

fs.writeFileSync('./src/screens/ReportDownloadScreen.js', c);
console.log('Pending Orders:', c.includes('Pending Orders'));
console.log('Status & KPIs:', c.includes('Status & KPIs'));
