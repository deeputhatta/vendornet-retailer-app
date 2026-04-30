const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

// Fix corrupted links
c = c.replace(/\[([a-zA-Z0-9_.]+)\]\(http:\/\/[^\)]+\)/g, '$1');

// Remove offers and new arrivals from initial Promise.allSettled call
c = c.replace(
  "        api.get('/listings/?has_offer=true&limit=10'), // will be re-fetched after myCategories loads",
  "        api.get('/orders/my'), // placeholder"
);
c = c.replace(
  "        api.get('/listings/?new_arrivals=true&days=7&limit=8'),",
  "        api.get('/orders/my'), // placeholder2"
);

// Remove the old offersRes handler that sets offers without category filter
c = c.replace(
  `      if (offersRes.status === 'fulfilled') {
        const offerList = (offersRes.value.data.listings || []).filter(l => l.offer_price);
        setOffers(offerList);
        if (offerList.length > 0) {
          const best = offerList.reduce((a, b) => {
            const discA = (a.price - a.offer_price) / a.price;
            const discB = (b.price - b.offer_price) / b.price;`,
  `      if (false && offersRes.status === 'fulfilled') {
        const offerList = (offersRes.value.data.listings || []).filter(l => l.offer_price);
        setOffers(offerList);
        if (offerList.length > 0) {
          const best = offerList.reduce((a, b) => {
            const discA = (a.price - a.offer_price) / a.price;
            const discB = (b.price - b.offer_price) / b.price;`
);

fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('Done');
