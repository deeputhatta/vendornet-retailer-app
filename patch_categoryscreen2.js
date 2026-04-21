const fs = require('fs');
let c = fs.readFileSync('./src/screens/CategoryScreen.js', 'utf8');

// Fix params extraction
c = c.replace(
  /const \{ category \} = route\.params[;]?/,
  `const { category, wholesaler_id } = route.params || {};`
);

// Fix loadListings
c = c.replace(
  /const res = await listingsAPI\.getListings\(\{ category_id: category\.category_id \}\);/,
  `const params = {};
      if (category?.category_id) params.category_id = category.category_id;
      if (wholesaler_id) params.wholesaler_id = wholesaler_id;
      const res = await listingsAPI.getListings(params);`
);

// Fix header title
c = c.replace(
  /\{category\.name\}/,
  `{category?.name || 'All Products'}`
);

fs.writeFileSync('./src/screens/CategoryScreen.js', c);

// Verify
const updated = fs.readFileSync('./src/screens/CategoryScreen.js', 'utf8');
console.log('wholesaler_id found:', updated.includes('wholesaler_id'));
console.log('params fixed:', updated.includes('params.wholesaler_id'));
