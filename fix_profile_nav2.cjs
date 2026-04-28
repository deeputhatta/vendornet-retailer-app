const fs = require('fs');
let c = fs.readFileSync('src/screens/ProfileScreen.js', 'utf8');

// CategoryPicker and ReportDownload are in MainStack (parent of HomeTabs)
c = c.replace(
  "onPress={() => navigation.getParent()?.navigate('CategoryPicker')}",
  "onPress={() => navigation.getParent()?.getParent()?.navigate('CategoryPicker')}"
);
c = c.replace(
  "onPress={() => navigation.getParent()?.navigate('ReportDownload')}",
  "onPress={() => navigation.getParent()?.getParent()?.navigate('ReportDownload')}"
);
c = c.replace(
  "onPress={() => navigation.getParent()?.navigate('Invoices')}",
  "onPress={() => navigation.getParent()?.getParent()?.navigate('Invoices')}"
);
c = c.replace(
  "onPress={() => navigation.getParent()?.navigate('Wishlist')}",
  "onPress={() => navigation.getParent()?.getParent()?.navigate('Wishlist')}"
);

fs.writeFileSync('src/screens/ProfileScreen.js', c);
console.log('done');
