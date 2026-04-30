const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

// Fix corrupted links
c = c.replace(/\[([a-zA-Z0-9_.]+)\]\(http:\/\/[^\)]+\)/g, '$1');

// Remove the broken newRes handler since newRes is now a placeholder
c = c.replace(
  "      if (newRes.status === 'fulfilled') setNewArrivals(newRes.value.data.listings || []);",
  "      // newArrivals fetched after categories load"
);

fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('Done');
