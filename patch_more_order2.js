const fs = require('fs');
let c = fs.readFileSync('C:/Users/leksh/retailer-app2/src/navigation/AppNavigator.js', 'utf8');

const start = c.indexOf('moreItems = [');
const end = c.indexOf('];', start) + 2;

const newItems = `moreItems = [
    { icon: '\uD83C\uDFF7', label: 'My Categories',   screen: 'CategoryPicker' },
    { icon: '\u2764\uFE0F', label: 'Wishlist',         screen: 'Wishlist' },
    { icon: '\uD83E\uDDFE', label: 'Invoices',         screen: 'Invoices' },
    { icon: '\uD83D\uDD14', label: 'Notifications',    screen: 'Notifications' },
    ...(isAdmin ? [{ icon: '\uD83D\uDC65', label: 'Staff Management', screen: 'StaffManagement' }] : []),
    { icon: '\uD83D\uDC64', label: 'Profile',          screen: 'Profile' },
  ];`;

c = c.substring(0, start) + newItems + c.substring(end);
fs.writeFileSync('C:/Users/leksh/retailer-app2/src/navigation/AppNavigator.js', c);

// Verify
const i = c.indexOf('moreItems');
console.log(c.substring(i, i+300));
