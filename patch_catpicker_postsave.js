const fs = require('fs');

// Retailer
let c = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', 'utf8');
const idx = c.indexOf("navigation.goBack();");
if (idx > -1) {
  c = c.substring(0, idx) + "navigation.navigate('Home');" + c.substring(idx + "navigation.goBack();".length);
  fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', c);
  console.log('Retailer fixed:', c.includes("navigate('Home')"));
}

// Wholesaler
let w = fs.readFileSync('C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js', 'utf8');
const widx = w.indexOf("navigation.goBack();");
if (widx > -1) {
  w = w.substring(0, widx) + "navigation.navigate('Dashboard');" + w.substring(widx + "navigation.goBack();".length);
  fs.writeFileSync('C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js', w);
  console.log('Wholesaler fixed:', w.includes("navigate('Dashboard')"));
}
