const fs = require('fs');
let c = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', 'utf8');

// Replace popToTop with navigate to Home tab via parent navigators
c = c.replace(
  `navigation.popToTop();`,
  `navigation.getParent()?.getParent()?.navigate('Home');`
);

fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', c);
console.log('Fixed:', c.includes("getParent()?.getParent()?.navigate('Home')"));
