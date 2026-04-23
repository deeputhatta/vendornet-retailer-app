const fs = require('fs');
let c = fs.readFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', 'utf8');

c = c.replace(
  'setCategoryChecked(false);',
  "navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'MainStack' }] }));"
);

fs.writeFileSync('C:/Users/leksh/retailer-app2/src/screens/CategoryPickerScreen.js', c);
console.log('MainStack:', c.includes('MainStack'));
