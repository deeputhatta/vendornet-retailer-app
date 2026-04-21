const fs = require('fs');
let c = fs.readFileSync('./src/navigation/AppNavigator.js', 'utf8');
c = c.replace("icon: 'CAT'", "icon: '\uD83C\uDFF7'");
fs.writeFileSync('./src/navigation/AppNavigator.js', c);
console.log('Fixed icon');
console.log(c.includes('My Categories') ? 'My Categories found' : 'NOT FOUND');
