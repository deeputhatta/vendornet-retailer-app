const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

// Fix all markdown link patterns including those with dots
c = c.replace(/\[([a-zA-Z0-9_.]+)\]\(http:\/\/[^\)]+\)/g, '$1');

// Also fix specific ones that might have different patterns
c = c.split('[spotRes2.data](http://spotRes2.data)').join('spotRes2.data');
c = c.split('[offersRes.value.data](http://offersRes.value.data)').join('offersRes.value.data');
c = c.split('[newRes.value.data](http://newRes.value.data)').join('newRes.value.data');
c = c.split('[catRes.value.data](http://catRes.value.data)').join('catRes.value.data');
c = c.split('[myRes.value.data](http://myRes.value.data)').join('myRes.value.data');
c = c.split('[statsRes.value.data](http://statsRes.value.data)').join('statsRes.value.data');
c = c.split('[spotRes.value.data](http://spotRes.value.data)').join('spotRes.value.data');
c = c.split('[req.query.new](http://req.query.new)').join('req.query.new');
c = c.split('[Date.now](http://Date.now)').join('Date.now');
c = c.split('[d.top](http://d.top)').join('d.top');
c = c.split('[s.bg](http://s.bg)').join('s.bg');
c = c.split('[spotlight.business](http://spotlight.business)').join('spotlight.business');
c = c.split('[spotlight.name](http://spotlight.name)').join('spotlight.name');
c = c.split('[res.data](http://res.data)').join('res.data');

fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('Fixed');
