const fs = require('fs');
let c = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

// Fix all corrupted hyperlinks
c = c.replace(/\[([a-zA-Z0-9_.]+)\]\(http:\/\/[^\)]+\)/g, '$1');

// 1. Filter offers by selected categories - pass category_ids to offers API
c = c.replace(
  "api.get('/listings/?has_offer=true&limit=10'),",
  "api.get('/listings/?has_offer=true&limit=10'), // will be re-fetched after myCategories loads"
);

// 2. After myCategories is set, re-fetch offers with category filter
// Find where myCategories is set and add re-fetch
c = c.replace(
  "if (myRes.status === 'fulfilled') setMyCategories(myRes.value.data.categories?.map(cat => cat.category_id) || []);",
  `if (myRes.status === 'fulfilled') {
        const myCats = myRes.value.data.categories?.map(cat => cat.category_id) || [];
        setMyCategories(myCats);
        // Re-fetch offers filtered by user's categories
        if (myCats.length > 0) {
          try {
            const filteredOffers = await api.get('/listings/?has_offer=true&limit=10&category_ids=' + myCats.join(','));
            const offerList = (filteredOffers.data.listings || []).filter(l => l.offer_price);
            setOffers(offerList);
            if (offerList.length > 0) {
              const best = offerList.reduce((a, b) => {
                const discA = (a.price - a.offer_price) / a.price;
                const discB = (b.price - b.offer_price) / b.price;
                return discA > discB ? a : b;
              });
              setBestDeal(best);
            }
          } catch(e) {}
        }
      }`
);

// 3. Replace My Orders smart card with Wholesalers smart card
c = c.replace(
  `              <TouchableOpacity
                style={[styles.smartCard, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => navigation.navigate('Orders')}>
                <Text style={styles.smartCardIcon}>📦</Text>
                <Text style={[styles.smartCardTitle, { color: c.text }]}>My Orders</Text>
                <Text style={[styles.smartCardSub, { color: c.textMuted, opacity: 0.75 }]}>Track & reorder</Text>
                <Text style={[styles.smartCardAction, { color: c.primary }]}>View →</Text>
              </TouchableOpacity>`,
  `              <TouchableOpacity
                style={[styles.smartCard, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => navigation.navigate('WholesalerList')}>
                <Text style={styles.smartCardIcon}>🏪</Text>
                <Text style={[styles.smartCardTitle, { color: c.text }]}>Wholesalers</Text>
                <Text style={[styles.smartCardSub, { color: c.textMuted, opacity: 0.75 }]}>Browse suppliers</Text>
                <Text style={[styles.smartCardAction, { color: c.primary }]}>View →</Text>
              </TouchableOpacity>`
);

fs.writeFileSync('src/screens/HomeScreen.js', c);
console.log('Done');
