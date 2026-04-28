const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');
c = c.replace(
  "onPress={() => navigation.navigate('Main', { screen: 'Catalogue' })}",
  "onPress={() => navigation.navigate('Category', { category: { category_id: null, name: 'All Products', slug: '' } })}"
);
fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('done');
