const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

// Fix corrupted links
c = c.replace(/\[([a-zA-Z0-9_.]+)\]\(http:\/\/[^\)]+\)/g, '$1');

// Change spotlight fetch to use category filter - move it to after categories load
c = c.replace(
  "        api.get('/orders/wholesaler-spotlight'),",
  "        api.get('/orders/wholesaler-spotlight'), // will be re-fetched with categories"
);

// Add spotlight re-fetch in the myCategories block
c = c.replace(
  `          // Re-fetch new arrivals filtered by categories
          try {`,
  `          // Re-fetch spotlight filtered by categories
          try {
            const spotRes2 = await api.get('/orders/wholesaler-spotlight?category_ids=' + myCats.join(','));
            setSpotlight(spotRes2.data.wholesaler);
          } catch(e) {}
          // Re-fetch new arrivals filtered by categories
          try {`
);

// Remove old spotlight handler
c = c.replace(
  "      if (spotRes.status === 'fulfilled') setSpotlight(spotRes.value.data.wholesaler);",
  "      // spotlight re-fetched after categories load"
);

fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('Done');
