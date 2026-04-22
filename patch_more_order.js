const fs = require('fs');
let c = fs.readFileSync('C:/Users/leksh/retailer-app2/src/navigation/AppNavigator.js', 'utf8');

c = c.replace("icon: 'CAT'", "icon: '\uD83C\uDFF7'");
c = c.replace("icon: 'WSH'", "icon: '\u2764\uFE0F'");
c = c.replace("icon: 'INV'", "icon: '\uD83E\uDDFE'");
c = c.replace("icon: 'NOT'", "icon: '\uD83D\uDD14'");
c = c.replace("icon: 'STF'", "icon: '\uD83D\uDC65'");
c = c.replace("icon: 'PRF'", "icon: '\uD83D\uDC64'");

fs.writeFileSync('C:/Users/leksh/retailer-app2/src/navigation/AppNavigator.js', c);

// Verify order
const i = c.indexOf('moreItems');
console.log(c.substring(i, i+400));
