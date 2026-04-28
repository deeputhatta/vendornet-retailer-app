const fs = require('fs');
let c = fs.readFileSync('src/screens/ProfileScreen.js', 'utf8');

// Orders, Analytics are tab screens - need navigate to Main first
c = c.replace(
  "onPress={() => navigation.navigate('Orders')}",
  "onPress={() => navigation.navigate('Main', { screen: 'Orders' })}"
);
c = c.replace(
  "onPress={() => navigation.navigate('Analytics')}",
  "onPress={() => navigation.navigate('Main', { screen: 'Analytics' })}"
);
c = c.replace(
  "onPress={() => navigation.navigate('Invoices')}",
  "onPress={() => navigation.getParent()?.navigate('Invoices')}"
);
c = c.replace(
  "onPress={() => navigation.navigate('Wishlist')}",
  "onPress={() => navigation.getParent()?.navigate('Wishlist')}"
);

fs.writeFileSync('src/screens/ProfileScreen.js', c);
console.log('done');
