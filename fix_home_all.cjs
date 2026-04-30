const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

const fixes = [
  ['[offers.map](http://offers.map)', 'offers.map'],
  ['[recentlyViewed.map](http://recentlyViewed.map)', 'recentlyViewed.map'],
  ['[newArrivals.map](http://newArrivals.map)', 'newArrivals.map'],
  ['[topSellers.map](http://topSellers.map)', 'topSellers.map'],
  ['[spotRes2.data](http://spotRes2.data)', 'spotRes2.data'],
  ['[spotlight.business](http://spotlight.business)', 'spotlight.business'],
  ['[spotlight.name](http://spotlight.name)', 'spotlight.name'],
  ['[catRes.value.data](http://catRes.value.data)', 'catRes.value.data'],
  ['[myRes.value.data](http://myRes.value.data)', 'myRes.value.data'],
  ['[statsRes.value.data](http://statsRes.value.data)', 'statsRes.value.data'],
  ['[offersRes.value.data](http://offersRes.value.data)', 'offersRes.value.data'],
  ['[newRes.value.data](http://newRes.value.data)', 'newRes.value.data'],
  ['[spotRes.value.data](http://spotRes.value.data)', 'spotRes.value.data'],
  ['[req.query.new](http://req.query.new)', 'req.query.new'],
  ['[Date.now](http://Date.now)', 'Date.now'],
  ['[d.top](http://d.top)', 'd.top'],
  ['[s.bg](http://s.bg)', 's.bg'],
  ['[res.data](http://res.data)', 'res.data'],
  ['[searchAPI.search](http://searchAPI.search)', 'searchAPI.search'],
  ['[categories.map](http://categories.map)', 'categories.map'],
];

let count = 0;
fixes.forEach(([from, to]) => {
  while (c.includes(from)) {
    c = c.split(from).join(to);
    count++;
  }
});

fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('Fixed', count, 'occurrences');
