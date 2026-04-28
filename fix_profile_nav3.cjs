const fs = require('fs');
let c = fs.readFileSync('src/screens/ProfileScreen.js', 'utf8');

// Profile is in MainStack so navigation.navigate works directly for MainStack screens
// But Orders/Analytics are inside HomeTabs (Main) so need Main + screen
c = c.replace(
  "onPress={() => navigation.navigate('Main', { screen: 'Orders' })}",
  "onPress={() => navigation.navigate('Main', { screen: 'Orders' })}"
);
c = c.replace(
  "onPress={() => navigation.navigate('Main', { screen: 'Analytics' })}",
  "onPress={() => navigation.navigate('Main', { screen: 'Analytics' })}"
);
// Invoices, Wishlist, CategoryPicker, ReportDownload are all MainStack screens
c = c.replace(
  "onPress={() => navigation.getParent()?.getParent()?.navigate('Invoices')}",
  "onPress={() => navigation.navigate('Invoices')}"
);
c = c.replace(
  "onPress={() => navigation.getParent()?.getParent()?.navigate('Wishlist')}",
  "onPress={() => navigation.navigate('Wishlist')}"
);
c = c.replace(
  "onPress={() => navigation.getParent()?.getParent()?.navigate('CategoryPicker')}",
  "onPress={() => navigation.navigate('CategoryPicker')}"
);
c = c.replace(
  "onPress={() => navigation.getParent()?.getParent()?.navigate('ReportDownload')}",
  "onPress={() => navigation.navigate('ReportDownload')}"
);

fs.writeFileSync('src/screens/ProfileScreen.js', c);
console.log('done');
