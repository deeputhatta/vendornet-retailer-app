const fs = require('fs');
let a = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/AnalyticsScreen.js', 'utf8');

// Find and fix the heroTop layout - make it flex row with space-between
const heroTopIdx = a.indexOf('styles.heroTop');
console.log('heroTop context:', a.substring(heroTopIdx - 20, heroTopIdx + 200));
