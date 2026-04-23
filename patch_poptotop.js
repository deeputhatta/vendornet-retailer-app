const fs = require('fs');
let c = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', 'utf8');

c = c.replace(
  `navigation.getParent()?.navigate('Home');`,
  `navigation.popToTop();`
);

fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', c);
console.log('Fixed:', c.includes('popToTop'));
