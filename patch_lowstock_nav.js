const fs = require('fs');
let c = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/HomeScreen.js', 'utf8');

// Find the low stock card onPress and replace
const marker = 'Low Stock Alert';
const idx = c.indexOf(marker);
const onPressStart = c.lastIndexOf('onPress={', idx);
const onPressEnd = c.indexOf('})}', onPressStart) + 3;

const oldOnPress = c.substring(onPressStart, onPressEnd);
console.log('Old onPress:', oldOnPress);

const newOnPress = `onPress={() => navigation.navigate('Category', { category: { category_id: lowStockItems[0].category_id || null, name: lowStockItems[0].category_name || 'Products', slug: '' } })}`;

c = c.substring(0, onPressStart) + newOnPress + c.substring(onPressEnd);
fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/HomeScreen.js', c);
console.log('Fixed');
