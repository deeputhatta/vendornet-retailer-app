const fs = require('fs');

let c = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', 'utf8');
c = c.replace(`navigation.navigate('Home');`, `navigation.navigate('MainStack', { screen: 'Home' });`);
fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', c);
console.log('Retailer fixed:', c.includes("screen: 'Home'"));

let w = fs.readFileSync('C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js', 'utf8');
w = w.replace(`navigation.navigate('Dashboard');`, `navigation.navigate('MainStack', { screen: 'Dashboard' });`);
fs.writeFileSync('C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js', w);
console.log('Wholesaler fixed:', w.includes("screen: 'Dashboard'"));
