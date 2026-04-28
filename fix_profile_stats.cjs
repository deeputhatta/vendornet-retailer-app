const fs = require('fs');
let c = fs.readFileSync('src/screens/ProfileScreen.js', 'utf8');

// Fix the analytics data extraction
c = c.replace(
  `      const res = analyticsRes;
      const d = res.data;`,
  `      const d = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : {};`
);

fs.writeFileSync('src/screens/ProfileScreen.js', c);
console.log('done');
