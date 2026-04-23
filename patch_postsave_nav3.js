const fs = require('fs');

// Retailer
let c = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', 'utf8');
c = c.replace(
  `navigation.navigate('MainStack', { screen: 'Home' });`,
  `navigation.getParent()?.navigate('Home');`
);
fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', c);
console.log('Retailer:', c.includes("getParent()?.navigate('Home')"));

// Wholesaler - find what navigate call is there
let w = fs.readFileSync('C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js', 'utf8');
const i = w.indexOf('if (isOnboarding)');
const j = w.indexOf('} else {', i);
const elseBlock = w.substring(j, j+200);
console.log('Wholesaler else block:', elseBlock);

// Replace any navigation call in else block
w = w.replace(
  /\{ text: 'OK', onPress: \(\) => \{[^}]*\} \}/,
  `{ text: 'OK', onPress: () => { navigation.getParent()?.navigate('Dashboard'); } }`
);
fs.writeFileSync('C:/Users/leksh/wholesaler-app/src/screens/CategoryPickerScreen.js', w);
console.log('Wholesaler:', w.includes("getParent()?.navigate('Dashboard')"));
