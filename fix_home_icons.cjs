const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

c = c.replace(
  `const CATEGORY_ICONS = {
  'cement': '🏗', 'steel-tmt': '⚙️', 'paint': '🎨',
  'electrical': '⚡', 'plumbing': '🔧', 'hardware': '🔨',
  'tiles': '🪟', 'power-tools': '🔌', 'wood': '🪵',
};
const getCategoryEmoji = (slug) => CATEGORY_ICONS[slug] || '📦';`,
  `const CATEGORY_ICONS = {
  'grocery-fmcg': '🛒',
  'pharma-medicine': '💊',
  'stationery-paper': '📝',
  'bags-luggage': '👜',
  'electronics': '📱',
  'textiles-garments': '👕',
  'food-beverage': '🍱',
  'cleaning-hygiene': '🧹',
  'hardware-tools': '🔧',
  'others': '📦',
};
const getCategoryEmoji = (slug) => CATEGORY_ICONS[slug] || '📦';`
);

fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('Done');
